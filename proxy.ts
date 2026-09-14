import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, defaultPathForRole, SESSION_COOKIE_NAME } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // A cookie can be cryptographically valid but point at a user that no
  // longer exists (e.g. the local database was reset while still logged
  // in). Catch that here — proxy is the only place outside a Server Action
  // allowed to clear cookies — otherwise /login sees a "valid" session and
  // immediately bounces back to the board, looping forever.
  let staleSession = false;
  if (session) {
    const user = await prisma.user.findUnique({ where: { id: session.uid }, select: { id: true } });
    staleSession = !user;
  }
  const validSession = session && !staleSession ? session : null;

  const isProtected = pathname.startsWith("/board") || pathname.startsWith("/my-board");

  if (isProtected && !validSession) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    if (staleSession) response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  if (pathname === "/login") {
    if (validSession) {
      return NextResponse.redirect(new URL(defaultPathForRole(validSession.role), request.url));
    }
    if (staleSession) {
      const response = NextResponse.next();
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/board/:path*", "/my-board/:path*", "/login"],
};
