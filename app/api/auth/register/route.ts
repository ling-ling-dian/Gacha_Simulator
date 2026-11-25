import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createUser, findUserByUsername } from "@/lib/db";
import { setSessionCookie, signSession } from "@/lib/auth";

const bodySchema = z.object({
  username: z.string().trim().min(3).max(20),
  password: z.string().min(6).max(72),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "用户名 3-20 位，密码至少 6 位" }, { status: 400 });
  const exists = await findUserByUsername(parsed.data.username);
  if (exists) return NextResponse.json({ error: "这个用户名已经有了" }, { status: 409 });
  const user = await createUser(parsed.data.username, await bcrypt.hash(parsed.data.password, 10));
  await setSessionCookie(await signSession(user.id));
  return NextResponse.json({ user });
}
