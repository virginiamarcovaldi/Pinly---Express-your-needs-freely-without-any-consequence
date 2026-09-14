import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, defaultPathForRole, SESSION_COOKIE_NAME } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isProtected = pathname.startsWith("/board") || pathname.startsWith("/my-board");

  if (isProtected && !session) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && session) {
    const url = new URL(defaultPathForRole(session.role), request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/board/:path*", "/my-board/:path*", "/login"],
};
