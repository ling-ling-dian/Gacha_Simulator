import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { setSessionCookie, signSession } from "@/lib/auth";

const bodySchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "用户名或密码不对" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "用户名或密码不对" }, { status: 401 });
  }
  await setSessionCookie(await signSession(user.id));
  return NextResponse.json({ user: { id: user.id, username: user.username } });
}
