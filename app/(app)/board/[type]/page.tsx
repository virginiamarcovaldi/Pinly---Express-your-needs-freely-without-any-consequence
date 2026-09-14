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
import { markSeen } from "@/lib/notifications";
import { formatDayTime, formatRelativeTime } from "@/lib/time";
import { CorkBoard } from "@/components/CorkBoard";
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
    // defaultPathForRole(STUDENT) is /board/classroom itself, so redirecting
    // there would loop forever for a student with no class on their
    // session — send them to re-authenticate instead.
    redirect("/login");
  }

  const board = await getOrCreateBoard(prisma, {
    schoolId: session.schoolId,
    type: boardType,
    classId: boardType === "CLASSROOM" ? session.classId : null,
  });

  const canPost = canPostToBoard(session, board);
  const audience = boardAudienceLabel(boardType);

  // Students only ever pin post-its here — the feed of what they (and
  // everyone else) wrote lives in their personal "My board" instead.
  if (canPost) {
    return (
      <div className="max-w-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-navy">{boardLabel(boardType)}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pin an anonymous post-it for {audience}. You&apos;ll find it — and any reply — on{" "}
            <span className="font-medium text-brand-navy">My board</span>.
          </p>
        </div>
        <NewNoteForm boardSlug={slug} audienceLabel={audience} />
      </div>
    );
  }

  await markSeen(session.uid);

  let classLabel: string | null = null;
  if (boardType === "CLASSROOM" && session.classId) {
    const schoolClass = await prisma.schoolClass.findUnique({ where: { id: session.classId } });
    classLabel = schoolClass?.name ?? null;
  }

  const notes = await prisma.note.findMany({
    where: { boardId: board.id },
    include: { replies: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  const staffLabel = roleLabel(staffRoleForBoardType(boardType));

  const noteCards: NoteCardData[] = notes.map((note, index) => ({
    id: note.id,
    color: note.color,
    text: note.text,
    timeLabel: formatDayTime(note.createdAt),
    rotation: postitRotation(index),
    canReply: canReplyToNote(session, board, note),
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
        <h1 className="text-2xl font-bold text-brand-navy">
          {boardLabel(boardType)}
          {classLabel ? ` — Class ${classLabel}` : ""}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Anonymous post-its from students. Reply below — they&apos;ll see it, you won&apos;t see
          who they are.
        </p>
      </div>

      {noteCards.length === 0 ? (
        <p className="text-sm text-slate-400 italic">No post-its pinned yet.</p>
      ) : (
        <CorkBoard>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {noteCards.map((note) => (
              <NoteCard key={note.id} note={note} boardSlug={slug} />
            ))}
          </div>
        </CorkBoard>
      )}
    </div>
  );
}
