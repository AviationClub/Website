import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "robo_admin_session";
const sessionAge = 12 * 60 * 60;

function secret() {
  const value = process.env.ROBO_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("ROBO_SESSION_SECRET must contain at least 32 characters.");
  return value;
}

function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function verifyCredentials(email: string, password: string) {
  const expectedEmail = process.env.ROBO_ADMIN_EMAIL?.trim().toLowerCase();
  const expectedPassword = process.env.ROBO_ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) throw new Error("Organizer credentials are not configured.");
  const emailMatches = email.trim().toLowerCase() === expectedEmail;
  const passwordMatches = Buffer.from(password).length === Buffer.from(expectedPassword).length
    && timingSafeEqual(Buffer.from(password), Buffer.from(expectedPassword));
  return emailMatches && passwordMatches;
}

export function createSessionCookie() {
  const payload = `${Date.now() + sessionAge * 1000}.${randomBytes(18).toString("hex")}`;
  const value = `${payload}.${signature(payload)}`;
  cookies().set(cookieName, value, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict",
    path: "/", maxAge: sessionAge,
  });
}

export function clearSessionCookie() {
  cookies().set(cookieName, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
}

export function hasAdminSession() {
  const value = cookies().get(cookieName)?.value;
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3 || !/^\d+$/.test(parts[0])) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const supplied = Buffer.from(parts[2], "hex");
  const expected = Buffer.from(signature(payload), "hex");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return false;
  return Number(parts[0]) > Date.now();
}
