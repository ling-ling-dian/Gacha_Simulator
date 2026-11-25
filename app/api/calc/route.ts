import { NextResponse } from "next/server";
import { z } from "zod";
import { getGame } from "@/lib/catalog";
import { solve } from "@/lib/calc/engine";

const schema = z.object({
  game: z.string(),
  requests: z.array(z.object({
    pool: z.string(),
    copies: z.number().int().min(0).max(200),
    state: z.object({
      pity: z.number().int().min(0).max(89),
      guaranteed: z.boolean(),
      lossCycles: z.number().int().min(0).max(6),
    }),
    ownedPieces: z.number().int().min(0).max(20).optional(),
    nikkiMode: z.enum(["set", "piece"]).optional(),
    blessing: z.boolean().optional(),
  })),
  spend: z.object({
    useDoubles: z.boolean(),
    usedDoubleIds: z.array(z.string()),
    includeMonthly: z.boolean(),
    includeBundles: z.boolean(),
    inventoryPulls: z.number().int().min(0),
    bonusPulls: z.number().int().min(0),
  }),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "计算参数不对" }, { status: 400 });
  const game = getGame(parsed.data.game);
  if (!game) return NextResponse.json({ error: "没有这个游戏" }, { status: 404 });
  return NextResponse.json(solve(game, parsed.data.requests, parsed.data.spend));
}
