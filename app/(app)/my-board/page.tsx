import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { boardTypeForStaffRole, boardTypeToSlug, canReplyToNote, roleLabel, staffRoleForBoardType } from "@/lib/permissions";
import { markSeen } from "@/lib/notifications";
import { formatRelativeTime } from "@/lib/time";
import { CorkBoard } from "@/components/CorkBoard";
import { postitRotation } from "@/components/Postit";
import { NoteCard, type NoteCardData } from "@/components/NoteCard";

export default async function MyBoardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Staff already see everything (post-its + their own replies) inline on
  // their one board — no separate mailboard needed, just send them there.
  if (session.role !== "STUDENT") {
    redirect(`/board/${boardTypeToSlug(boardTypeForStaffRole(session.role))}`);
  }

  await markSeen(session.uid);

  const notes = await prisma.note.findMany({
    where: { authorId: session.uid },
    include: { board: true, replies: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  const noteCards: (NoteCardData & { boardSlug: string })[] = notes.map((note, index) => ({
    id: note.id,
    color: note.color,
    text: note.text,
    timeLabel: formatRelativeTime(note.createdAt),
    isOwn: true,
    rotation: postitRotation(index),
    canReply: canReplyToNote(session, note.board, note),
    boardSlug: boardTypeToSlug(note.board.type),
    replies: note.replies.map((reply) => ({
      id: reply.id,
      text: reply.text,
      timeLabel: formatRelativeTime(reply.createdAt),
      isYou: reply.authorId === session.uid,
      label: reply.authorId === session.uid ? "You" : roleLabel(staffRoleForBoardType(note.board.type)),
    })),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">My board</h1>
        <p className="text-sm text-slate-500 mt-1">
          Every post-it you&apos;ve pinned, across all three boards, and any replies you&apos;ve
          received — reply back any time.
        </p>
      </div>

      {noteCards.length === 0 ? (
        <p className="text-sm text-slate-400 italic">
          You haven&apos;t pinned anything yet — head to a board to get started.
        </p>
      ) : (
        <CorkBoard>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {noteCards.map((note) => (
              <NoteCard key={note.id} note={note} boardSlug={note.boardSlug} />
            ))}
          </div>
        </CorkBoard>
      )}
    </div>
  );
}
