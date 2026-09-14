import type { BoardType, NoteColor } from "./generated/prisma/client";

export const NOTE_COLORS: NoteColor[] = ["YELLOW", "BLUE", "PINK", "GREEN", "ORANGE"];

/**
 * A student's post-it color is fixed per board (same student, same board ->
 * always the same color) but varies across students and across boards, so
 * no single color becomes a recognizable "signature" while still letting
 * staff notice recurring anonymous voices on their own board.
 */
export function pickNoteColor(userId: string, boardType: BoardType): NoteColor {
  const key = `${userId}:${boardType}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return NOTE_COLORS[Math.abs(hash) % NOTE_COLORS.length];
}
