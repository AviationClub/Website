import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, createSessionCookie, hasAdminSession, verifyCredentials } from "@/lib/robo-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ authenticated: hasAdminSession() });
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Enter your organizer email and password." }, { status: 400 });
    }
    if (!verifyCredentials(email, password)) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }
    createSessionCookie();
    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error("Organizer sign-in configuration error:", error);
    return NextResponse.json({ error: "Organizer sign-in is not configured on the server." }, { status: 503 });
  }
}

export async function DELETE() {
  clearSessionCookie();
  return NextResponse.json({ authenticated: false });
}
