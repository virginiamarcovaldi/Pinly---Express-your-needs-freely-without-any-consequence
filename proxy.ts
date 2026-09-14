import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Visiting /login always starts fresh: clear any existing session instead
  // of auto-redirecting an already-authenticated visitor away. That makes
  // switching between accounts (e.g. testing different roles) a single
  // click on "Log in", rather than requiring an explicit log out first.
  if (pathname === "/login") {
    if (!token) return NextResponse.next();
    const response = NextResponse.next();
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  const isProtected = pathname.startsWith("/board") || pathname.startsWith("/my-board");
  if (!isProtected) return NextResponse.next();

  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // A cookie can be cryptographically valid but point at a user that no
  // longer exists (e.g. the local database was reset while still logged
  // in). Clear it here — proxy is the only place outside a Server Action
  // allowed to — otherwise /login would see a "valid" token and this
  // check would never get a chance to run again.
  const user = await prisma.user.findUnique({ where: { id: session.uid }, select: { id: true } });
  if (!user) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/board/:path*", "/my-board/:path*", "/login"],
};
