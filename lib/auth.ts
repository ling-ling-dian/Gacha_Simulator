import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/db";

const cookieName = "gacha_session";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("缺少 AUTH_SECRET");
  return new TextEncoder().encode(value);
}

export async function signSession(userId: string) {
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret());
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(cookieName);
}

export async function currentUser() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const userId = String(payload.uid ?? "");
    if (!userId) return null;
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });
  } catch {
    return null;
  }
}
