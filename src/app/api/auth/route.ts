import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, AUTH_TOKEN_VALUE } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    const correctPin = process.env.APP_PIN || "1234";

    if (pin !== correctPin) {
      return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE_NAME, AUTH_TOKEN_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
