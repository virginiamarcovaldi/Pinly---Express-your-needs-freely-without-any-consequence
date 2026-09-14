import type { BoardType, Role } from "./generated/prisma/client";
import type { SessionPayload } from "./auth";

export const BOARD_SLUGS = {
  classroom: "CLASSROOM",
  school: "SCHOOL",
  wellbeing: "WELLBEING",
} as const satisfies Record<string, BoardType>;

export type BoardSlug = keyof typeof BOARD_SLUGS;

export function slugToBoardType(slug: string): BoardType | null {
  return BOARD_SLUGS[slug as BoardSlug] ?? null;
}

export function boardTypeToSlug(type: BoardType): BoardSlug {
  const entry = Object.entries(BOARD_SLUGS).find(([, v]) => v === type);
  return (entry?.[0] as BoardSlug) ?? "classroom";
}

/** The staff role that receives notes on a given board type. */
export function staffRoleForBoardType(type: BoardType): Role {
  switch (type) {
    case "CLASSROOM":
      return "TEACHER";
    case "SCHOOL":
      return "STUDENT_REP";
    case "WELLBEING":
      return "COUNSELOR";
  }
}

/** The inverse of staffRoleForBoardType: which board a staff role owns. */
export function boardTypeForStaffRole(role: Role): BoardType {
  switch (role) {
    case "TEACHER":
      return "CLASSROOM";
    case "STUDENT_REP":
      return "SCHOOL";
    case "COUNSELOR":
      return "WELLBEING";
    case "STUDENT":
      throw new Error("Students don't own a board.");
  }
}

export function boardLabel(type: BoardType): string {
  switch (type) {
    case "CLASSROOM":
      return "Classroom Board";
    case "SCHOOL":
      return "School Board";
    case "WELLBEING":
      return "Wellbeing Board";
  }
}

export function roleLabel(role: Role): string {
  switch (role) {
    case "STUDENT":
      return "Student";
    case "TEACHER":
      return "Teacher";
    case "STUDENT_REP":
      return "Student Rep";
    case "COUNSELOR":
      return "Counselor";
  }
}

export function boardAudienceLabel(type: BoardType): string {
  switch (type) {
    case "CLASSROOM":
      return "your teacher";
    case "SCHOOL":
      return "the student rep";
    case "WELLBEING":
      return "the counselor";
  }
}

type BoardLike = { type: BoardType; classId: string | null; schoolId: string };

/** Can this user see this board's notes at all? */
export function canViewBoard(session: SessionPayload, board: BoardLike): boolean {
  if (session.schoolId !== board.schoolId) return false;

  if (session.role === "STUDENT") {
    if (board.type === "CLASSROOM") return board.classId === session.classId;
    return true; // SCHOOL and WELLBEING boards are open to every student in the school
  }

  if (session.role !== staffRoleForBoardType(board.type)) return false;
  if (board.type === "CLASSROOM") return board.classId === session.classId;
  return true;
}

/** Can this user pin a new post-it on this board? Only students post; staff only reply. */
export function canPostToBoard(session: SessionPayload, board: BoardLike): boolean {
  return session.role === "STUDENT" && canViewBoard(session, board);
}

/**
 * Can this user reply inside a given note's thread? Only the staff role that
 * owns the board (teacher/student rep/counselor) can reply — students can
 * only pin new post-its, never reply, not even to their own note.
 */
export function canReplyToNote(session: SessionPayload, board: BoardLike): boolean {
  if (session.role === "STUDENT") return false;
  return canViewBoard(session, board);
}

/** Which board slugs this role is allowed to navigate to. */
export function boardsForRole(role: Role): BoardSlug[] {
  if (role === "STUDENT") return ["classroom", "school", "wellbeing"];
  if (role === "TEACHER") return ["classroom"];
  if (role === "STUDENT_REP") return ["school"];
  return ["wellbeing"];
}
