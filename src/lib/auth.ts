import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole, UserStatus } from "@prisma/client";\nimport { prisma } from "@/lib/prisma";

const COOKIE_NAME = "internhub_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters.");
  return new TextEncoder().encode(secret);
}

export async function createSession(user: { id: string; role: UserRole }) {
  const token = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || (payload.role !== "ADMIN" && payload.role !== "INTERN")) return null;
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { role: true, status: true } });\n    if (!user || user.status !== UserStatus.ACTIVE || user.role !== payload.role) return null;\n    return { userId: payload.sub, role: user.role };
  } catch {
    return null;
  }
}

export async function requireRole(roles: UserRole[]) {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) return null;
  return session;
}
