import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getGame } from "@/lib/catalog";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Context) {
  const { slug } = await context.params;
  const user = await currentUser();
  if (!user) return NextResponse.json({ progress: null }, { status: 401 });
  const game = getGame(slug);
  if (!game) return NextResponse.json({ error: "没有这个游戏" }, { status: 404 });
  const row = await prisma.userGameProgress.findUnique({
    where: { userId_gameId: { userId: user.id, gameId: slug } },
  });
  return NextResponse.json({ progress: row?.payload ?? null });
}

export async function PUT(request: Request, context: Context) {
  const { slug } = await context.params;
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "先登录" }, { status: 401 });
  const game = getGame(slug);
  if (!game) return NextResponse.json({ error: "没有这个游戏" }, { status: 404 });
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") return NextResponse.json({ error: "进度是空的" }, { status: 400 });
  await prisma.userGameProgress.upsert({
    where: { userId_gameId: { userId: user.id, gameId: slug } },
    create: { userId: user.id, gameId: slug, payload },
    update: { payload },
  });
  return NextResponse.json({ ok: true });
}
