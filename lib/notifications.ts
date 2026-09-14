import { prisma } from "./db";
import type { SessionPayload } from "./session";
import { boardTypeForStaffRole } from "./permissions";
import { getOrCreateBoard } from "./boards";

/**
 * Number of replies (students) or new notes/replies (staff) that arrived
 * since this user last checked their board/mailboard — drives the red
 * notification badge in the nav.
 */
export async function getUnreadCount(session: SessionPayload): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { lastSeenAt: true, createdAt: true },
  });
  if (!user) return 0;
  const since = user.lastSeenAt ?? user.createdAt;

  if (session.role === "STUDENT") {
    return prisma.reply.count({
      where: {
        note: { authorId: session.uid },
        authorId: { not: session.uid },
        createdAt: { gt: since },
      },
    });
  }

  const boardType = boardTypeForStaffRole(session.role);
  const board = await getOrCreateBoard(prisma, {
    schoolId: session.schoolId,
    type: boardType,
    classId: boardType === "CLASSROOM" ? session.classId : null,
  });

  const [newNotes, newReplies] = await Promise.all([
    prisma.note.count({ where: { boardId: board.id, createdAt: { gt: since } } }),
    prisma.reply.count({
      where: {
        note: { boardId: board.id },
        authorId: { not: session.uid },
        createdAt: { gt: since },
      },
    }),
  ]);
  return newNotes + newReplies;
}

/** Marks the current moment as "seen", clearing the unread badge. */
export async function markSeen(userId: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { lastSeenAt: new Date() } });
}
