import { NextResponse } from "next/server";

import { createSessionToken, getSessionCookieOptions, SESSION_COOKIE_NAME, verifyPassword } from "@/lib/auth";

type UnlockBody = {
  password?: string;
};

export async function POST(request: Request) {
  let body: UnlockBody = {};
  try {
    body = (await request.json()) as UnlockBody;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const password = body.password?.trim() || "";
  if (!password || !verifyPassword(password)) {
    return NextResponse.json({ ok: false, message: "Wrong password." }, { status: 401 });
  }

  const token = createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
  return response;
}
