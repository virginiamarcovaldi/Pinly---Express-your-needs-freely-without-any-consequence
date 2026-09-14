import { SignJWT, jwtVerify } from "jose";
import type { Role } from "./generated/prisma/client";

// Pure JWT helpers with no next/headers dependency, so this file is safe to
// import from proxy.ts (which runs outside the request-scoped RSC context).

export const SESSION_COOKIE_NAME = "pinly_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set. Copy .env.example to .env and set it.");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  uid: string;
  email: string;
  role: Role;
  schoolId: string;
  classId: string | null;
};

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (
      typeof payload.uid === "string" &&
      typeof payload.email === "string" &&
      typeof payload.role === "string" &&
      typeof payload.schoolId === "string"
    ) {
      return {
        uid: payload.uid,
        email: payload.email,
        role: payload.role as Role,
        schoolId: payload.schoolId,
        classId: (payload.classId as string | null) ?? null,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** Where a role should land after login. */
export function defaultPathForRole(role: Role): string {
  switch (role) {
    case "TEACHER":
      return "/board/classroom";
    case "STUDENT_REP":
      return "/board/school";
    case "COUNSELOR":
      return "/board/wellbeing";
    case "STUDENT":
    default:
      return "/board/classroom";
  }
}
