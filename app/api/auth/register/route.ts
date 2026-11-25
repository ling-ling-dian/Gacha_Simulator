import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { setSessionCookie, signSession } from "@/lib/auth";

const bodySchema = z.object({
  username: z.string().trim().min(3).max(20),
  password: z.string().min(6).max(72),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "用户名 3-20 位，密码至少 6 位" }, { status: 400 });
  const exists = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (exists) return NextResponse.json({ error: "这个用户名已经有了" }, { status: 409 });
  const user = await prisma.user.create({
    data: {
      username: parsed.data.username,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
    },
    select: { id: true, username: true },
  });
  await setSessionCookie(await signSession(user.id));
  return NextResponse.json({ user });
}
