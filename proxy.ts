import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { verifySessionTokenEdge } from "@/lib/auth-edge";

const PROTECTED_PREFIXES = ["/home", "/timeline", "/blog", "/api/media"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (await verifySessionTokenEdge(token)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/media")) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("locked", "1");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/home/:path*", "/timeline/:path*", "/blog/:path*", "/api/media/:path*"]
};
