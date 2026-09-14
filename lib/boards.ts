import type { PrismaClient, Prisma, BoardType } from "./generated/prisma/client";

type PrismaLike = PrismaClient | Prisma.TransactionClient;

/**
 * SQLite + Prisma can't upsert on a compound unique key that includes a
 * nullable column (classId is null for SCHOOL/WELLBEING boards), so we
 * find-then-create instead.
 */
export async function getOrCreateBoard(
  client: PrismaLike,
  params: { schoolId: string; type: BoardType; classId?: string | null }
) {
  const classId = params.classId ?? null;
  const existing = await client.board.findFirst({
    where: { schoolId: params.schoolId, type: params.type, classId },
  });
  if (existing) return existing;
  return client.board.create({
    data: { schoolId: params.schoolId, type: params.type, classId },
  });
}
