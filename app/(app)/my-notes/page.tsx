import { redirect } from "next/navigation";
import { getSession, defaultPathForRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { boardLabel, boardTypeToSlug, canReplyToNote, roleLabel, staffRoleForBoardType } from "@/lib/permissions";
import { formatRelativeTime } from "@/lib/time";
import { postitRotation } from "@/components/Postit";
import { NoteCard, type NoteCardData } from "@/components/NoteCard";

export default async function MyNotesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "STUDENT") redirect(defaultPathForRole(session.role));

  const notes = await prisma.note.findMany({
    where: { authorId: session.uid },
    include: { replies: { orderBy: { createdAt: "asc" } }, board: true },
    orderBy: { createdAt: "desc" },
  });

  const items = notes.map((note, index) => {
    const slug = boardTypeToSlug(note.board.type);
    const card: NoteCardData = {
      id: note.id,
      color: note.color,
      text: note.text,
      timeLabel: formatRelativeTime(note.createdAt),
      isOwn: true,
      rotation: postitRotation(index),
      canReply: canReplyToNote(session, note.board, note),
      replies: note.replies.map((reply) => ({
        id: reply.id,
        text: reply.text,
        timeLabel: formatRelativeTime(reply.createdAt),
        isYou: reply.authorId === session.uid,
        label: reply.authorId === session.uid ? "You" : roleLabel(staffRoleForBoardType(note.board.type)),
      })),
    };
    return { slug, card, boardType: note.board.type };
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">My notes</h1>
        <p className="text-sm text-slate-500 mt-1">
          Every post-it you&apos;ve pinned, across all three boards, and any replies you&apos;ve received.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-400 italic">
          You haven&apos;t pinned anything yet — head to a board to get started.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(({ slug, card, boardType }) => (
            <div key={card.id} className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wide font-semibold text-brand-navy/50">
                {boardLabel(boardType)}
              </span>
              <NoteCard note={card} boardSlug={slug} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
