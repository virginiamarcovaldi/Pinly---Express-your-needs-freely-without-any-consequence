import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOrCreateBoard } from "@/lib/boards";
import {
  boardAudienceLabel,
  boardLabel,
  boardsForRole,
  canPostToBoard,
  canReplyToNote,
  roleLabel,
  slugToBoardType,
  staffRoleForBoardType,
  type BoardSlug,
} from "@/lib/permissions";
import { defaultPathForRole } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/time";
import { postitRotation } from "@/components/Postit";
import { NewNoteForm } from "@/components/NewNoteForm";
import { NoteCard, type NoteCardData } from "@/components/NoteCard";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: slug } = await params;

  const session = await getSession();
  if (!session) redirect("/login");

  const boardType = slugToBoardType(slug);
  if (!boardType) notFound();

  if (!boardsForRole(session.role).includes(slug as BoardSlug)) {
    redirect(defaultPathForRole(session.role));
  }

  if (boardType === "CLASSROOM" && !session.classId) {
    redirect(defaultPathForRole(session.role));
  }

  const board = await getOrCreateBoard(prisma, {
    schoolId: session.schoolId,
    type: boardType,
    classId: boardType === "CLASSROOM" ? session.classId : null,
  });

  const notes = await prisma.note.findMany({
    where: { boardId: board.id },
    include: { replies: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  const canPost = canPostToBoard(session, board);
  const audience = boardAudienceLabel(boardType);
  const staffLabel = roleLabel(staffRoleForBoardType(boardType));

  const noteCards: NoteCardData[] = notes.map((note, index) => ({
    id: note.id,
    color: note.color,
    text: note.text,
    timeLabel: formatRelativeTime(note.createdAt),
    isOwn: note.authorId === session.uid,
    rotation: postitRotation(index),
    canReply: canReplyToNote(session, board),
    replies: note.replies.map((reply) => ({
      id: reply.id,
      text: reply.text,
      timeLabel: formatRelativeTime(reply.createdAt),
      isYou: reply.authorId === session.uid,
      label:
        reply.authorId === session.uid
          ? "You"
          : reply.authorId === note.authorId
            ? "Anonymous"
            : staffLabel,
    })),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">{boardLabel(boardType)}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {canPost
            ? `Anonymous post-its, pinned for ${audience}.`
            : "Anonymous post-its from students. Reply below — they'll see it, you won't see who they are."}
        </p>
      </div>

      {canPost && <NewNoteForm boardSlug={slug} audienceLabel={audience} />}

      {noteCards.length === 0 ? (
        <p className="text-sm text-slate-400 italic">No post-its pinned yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {noteCards.map((note) => (
            <NoteCard key={note.id} note={note} boardSlug={slug} />
          ))}
        </div>
      )}
    </div>
  );
}
