"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOrCreateBoard } from "@/lib/boards";
import { canPostToBoard, canReplyToNote, slugToBoardType } from "@/lib/permissions";
import type { NoteColor } from "@/lib/generated/prisma/client";

const MAX_NOTE_LENGTH = 500;
const MAX_REPLY_LENGTH = 500;

export type ActionResult = { ok: false; error: string } | { ok: true };

async function boardForSlug(schoolId: string, slug: string, classId: string | null) {
  const type = slugToBoardType(slug);
  if (!type) return null;
  return getOrCreateBoard(prisma, {
    schoolId,
    type,
    classId: type === "CLASSROOM" ? classId : null,
  });
}

export async function createNote(
  boardSlug: string,
  color: NoteColor,
  text: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "You need to log in again." };

  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Write something before pinning it." };
  if (trimmed.length > MAX_NOTE_LENGTH) {
    return { ok: false, error: `Keep it under ${MAX_NOTE_LENGTH} characters.` };
  }

  const board = await boardForSlug(session.schoolId, boardSlug, session.classId);
  if (!board || !canPostToBoard(session, board)) {
    return { ok: false, error: "You can't post to this board." };
  }

  await prisma.note.create({
    data: { boardId: board.id, authorId: session.uid, color, text: trimmed },
  });

  revalidatePath(`/board/${boardSlug}`);
  return { ok: true };
}

export async function createReply(
  boardSlug: string,
  noteId: string,
  text: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "You need to log in again." };

  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Write a reply first." };
  if (trimmed.length > MAX_REPLY_LENGTH) {
    return { ok: false, error: `Keep it under ${MAX_REPLY_LENGTH} characters.` };
  }

  const board = await boardForSlug(session.schoolId, boardSlug, session.classId);
  if (!board) return { ok: false, error: "Board not found." };

  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note || note.boardId !== board.id) return { ok: false, error: "Note not found." };

  if (!canReplyToNote(session, board)) {
    return { ok: false, error: "You can't reply to this note." };
  }

  await prisma.reply.create({
    data: { noteId: note.id, authorId: session.uid, text: trimmed },
  });

  revalidatePath(`/board/${boardSlug}`);
  return { ok: true };
}
