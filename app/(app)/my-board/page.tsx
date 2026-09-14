import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOrCreateBoard } from "@/lib/boards";
import { boardLabel, boardTypeForStaffRole, roleLabel, staffRoleForBoardType } from "@/lib/permissions";
import { formatRelativeTime } from "@/lib/time";
import { truncate } from "@/lib/text";
import { NOTE_COLORS, postitRotation } from "@/components/Postit";
import { MailboardTabs, type MailboardItem } from "@/components/MailboardTabs";

export default async function MyBoardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let received: MailboardItem[];
  let sent: MailboardItem[];

  if (session.role === "STUDENT") {
    const notes = await prisma.note.findMany({
      where: { authorId: session.uid },
      include: { board: true, replies: true },
      orderBy: { createdAt: "desc" },
    });
    sent = notes.map((note, index) => ({
      id: note.id,
      color: note.color,
      text: note.text,
      timeLabel: formatRelativeTime(note.createdAt),
      boardLabel: boardLabel(note.board.type),
      meta:
        note.replies.length > 0
          ? `${note.replies.length} ${note.replies.length === 1 ? "reply" : "replies"}`
          : "No reply yet",
      rotation: postitRotation(index),
    }));

    const replies = await prisma.reply.findMany({
      where: { note: { authorId: session.uid } },
      include: { note: { include: { board: true } } },
      orderBy: { createdAt: "desc" },
    });
    received = replies.map((reply, index) => ({
      id: reply.id,
      color: NOTE_COLORS[index % NOTE_COLORS.length],
      text: reply.text,
      timeLabel: formatRelativeTime(reply.createdAt),
      boardLabel: boardLabel(reply.note.board.type),
      meta: `From ${roleLabel(staffRoleForBoardType(reply.note.board.type))} · on "${truncate(reply.note.text)}"`,
      rotation: postitRotation(index),
    }));
  } else {
    const boardType = boardTypeForStaffRole(session.role);
    const board = await getOrCreateBoard(prisma, {
      schoolId: session.schoolId,
      type: boardType,
      classId: boardType === "CLASSROOM" ? session.classId : null,
    });

    const notes = await prisma.note.findMany({
      where: { boardId: board.id },
      include: { board: true, replies: true },
      orderBy: { createdAt: "desc" },
    });
    received = notes.map((note, index) => ({
      id: note.id,
      color: note.color,
      text: note.text,
      timeLabel: formatRelativeTime(note.createdAt),
      boardLabel: boardLabel(note.board.type),
      meta: note.replies.some((r) => r.authorId === session.uid) ? "You replied" : "Awaiting your reply",
      rotation: postitRotation(index),
    }));

    const replies = await prisma.reply.findMany({
      where: { authorId: session.uid },
      include: { note: { include: { board: true } } },
      orderBy: { createdAt: "desc" },
    });
    sent = replies.map((reply, index) => ({
      id: reply.id,
      color: NOTE_COLORS[index % NOTE_COLORS.length],
      text: reply.text,
      timeLabel: formatRelativeTime(reply.createdAt),
      boardLabel: boardLabel(reply.note.board.type),
      meta: `Your reply on "${truncate(reply.note.text)}"`,
      rotation: postitRotation(index),
    }));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">My board</h1>
        <p className="text-sm text-slate-500 mt-1">
          Every post-it you&apos;ve received and sent, pinned on your own visual board.
        </p>
      </div>

      <MailboardTabs received={received} sent={sent} />
    </div>
  );
}
