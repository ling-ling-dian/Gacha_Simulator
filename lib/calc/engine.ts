import type { GameDef, PoolDef, ShopPack } from "@/lib/catalog";

export type PoolState = {
  pity: number;
  guaranteed: boolean;
  lossCycles: number;
};

export type PoolRequest = {
  pool: string;
  copies: number;
  state: PoolState;
  /** 暖暖：已有部件数 */
  ownedPieces?: number;
  /** 暖暖：set = 凑套，piece = 指定一件 */
  nikkiMode?: "set" | "piece";
  /** 暖暖：海风的祝颂还没用 */
  blessing?: boolean;
};

export type SpendInput = {
  useDoubles: boolean;
  usedDoubleIds: string[];
  includeMonthly: boolean;
  includeBundles: boolean;
  inventoryPulls: number;
  bonusPulls: number;
};

export type PlanLine = {
  id: string;
  name: string;
  qty: number;
  priceCny: number;
  crystals: number;
};

export type SpendPlan = {
  costCny: number;
  crystals: number;
  lines: PlanLine[];
};

export type CalcResult = {
  worstPulls: number;
  expectedPulls: number;
  pullsToBuy: number;
  instant: SpendPlan;
  patient: SpendPlan | null;
  byPool: Array<{ pool: string; label: string; worst: number; expected: number }>;
  notes: string[];
};

export function worstRateup(rule: PoolDef, state: PoolState, copies: number): number {
  let pity = clamp(state.pity, 0, Math.max(0, rule.hardPity - 1));
  let guaranteed = state.guaranteed;
  let cycles = Math.max(0, state.lossCycles);
  let pulls = 0;
  let left = copies;
  while (left > 0) {
    pulls += Math.max(1, rule.hardPity - pity);
    pity = 0;
    const forced =
      guaranteed ||
      (rule.radianceAfterCycles !== undefined && cycles >= rule.radianceAfterCycles) ||
      rule.featuredRate >= 1;
    if (forced) {
      left -= 1;
      if (guaranteed && rule.radianceAfterCycles !== undefined) cycles += 1;
      else cycles = 0;
      guaranteed = false;
    } else {
      guaranteed = true;
    }
  }
  return pulls;
}

export function expectedRateup(rule: PoolDef, state: PoolState, copies: number): number {
  const avg = 1 / rule.consolidatedFiveRate;
  const memo = new Map<string, number>();

  function step(pity: number) {
    const hardLeft = Math.max(1, rule.hardPity - pity);
    if (pity <= 0) return Math.min(rule.hardPity, avg);
    if (pity < avg) return Math.min(hardLeft, Math.max(1, avg - pity));
    return Math.max(1, hardLeft * 0.45);
  }

  function go(left: number, guaranteed: boolean, cycles: number, pity: number): number {
    if (left <= 0) return 0;
    const key = `${left}|${guaranteed ? 1 : 0}|${cycles}|${pity}`;
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    const add = step(pity);
    const forced =
      guaranteed ||
      (rule.radianceAfterCycles !== undefined && cycles >= rule.radianceAfterCycles) ||
      rule.featuredRate >= 1;
    let value: number;
    if (forced) {
      const nextCycles =
        guaranteed && rule.radianceAfterCycles !== undefined ? cycles + 1 : 0;
      value = add + go(left - 1, false, nextCycles, 0);
    } else {
      value =
        add +
        rule.featuredRate * go(left - 1, false, 0, 0) +
        (1 - rule.featuredRate) * go(left, true, cycles, 0);
    }
    memo.set(key, value);
    return value;
  }

  return go(
    copies,
    state.guaranteed,
    Math.max(0, state.lossCycles),
    clamp(state.pity, 0, Math.max(0, rule.hardPity - 1)),
  );
}

export function nikkiWorst(
  rule: PoolDef,
  copies: number,
  ownedPieces: number,
  mode: "set" | "piece",
  blessing: boolean,
): number {
  const setSize = rule.setSize ?? 9;
  const owned = clamp(ownedPieces, 0, setSize);
  const missing = setSize - owned;
  if (mode === "piece") {
    if (missing <= 0) return rule.hardPity * Math.max(1, copies);
    const slots = blessing ? Math.min(5, missing) : missing;
    return slots * rule.hardPity;
  }
  const extraSets = Math.max(0, copies - (missing > 0 ? 1 : 0));
  const first = missing > 0 ? missing * rule.hardPity : 0;
  return first + extraSets * setSize * rule.hardPity;
}

export function planSpend(needCrystals: number, packs: ShopPack[]): SpendPlan {
  if (needCrystals <= 0 || packs.length === 0) {
    return { costCny: 0, crystals: 0, lines: [] };
  }
  const cap = needCrystals + Math.max(...packs.map((p) => p.crystals));
  const cost = new Float64Array(cap + 1);
  cost.fill(Number.POSITIVE_INFINITY);
  cost[0] = 0;
  const prev = new Int32Array(cap + 1).fill(-1);
  const packAt = new Int16Array(cap + 1).fill(-1);

  packs.forEach((pack, index) => {
    if (pack.crystals <= 0 || pack.maxQty <= 0) return;
    if (pack.maxQty >= 100) {
      for (let c = pack.crystals; c <= cap; c++) {
        const next = cost[c - pack.crystals] + pack.priceCny;
        if (next < cost[c]) {
          cost[c] = next;
          prev[c] = c - pack.crystals;
          packAt[c] = index;
        }
      }
      return;
    }
    for (let q = 0; q < pack.maxQty; q++) {
      for (let c = cap; c >= pack.crystals; c--) {
        const base = cost[c - pack.crystals];
        if (base === Number.POSITIVE_INFINITY) continue;
        const next = base + pack.priceCny;
        if (next < cost[c]) {
          cost[c] = next;
          prev[c] = c - pack.crystals;
          packAt[c] = index;
        }
      }
    }
  });

  let best = -1;
  for (let c = needCrystals; c <= cap; c++) {
    if (cost[c] === Number.POSITIVE_INFINITY) continue;
    if (best < 0 || cost[c] < cost[best] || (cost[c] === cost[best] && c < best)) best = c;
  }
  if (best < 0) {
    return { costCny: 0, crystals: 0, lines: [] };
  }

  const counts = new Map<number, number>();
  let cursor = best;
  const guard = new Set<number>();
  while (cursor > 0 && !guard.has(cursor)) {
    guard.add(cursor);
    const index = packAt[cursor];
    if (index < 0) break;
    counts.set(index, (counts.get(index) ?? 0) + 1);
    cursor = prev[cursor];
  }

  const lines: PlanLine[] = [...counts.entries()].map(([index, qty]) => ({
    id: packs[index].id,
    name: packs[index].name,
    qty,
    priceCny: packs[index].priceCny * qty,
    crystals: packs[index].crystals * qty,
  }));

  return { costCny: cost[best], crystals: best, lines };
}

export function solve(game: GameDef, requests: PoolRequest[], spend: SpendInput): CalcResult {
  const byPool: CalcResult["byPool"] = [];
  let worstPulls = 0;
  let expectedPulls = 0;

  for (const request of requests) {
    if (request.copies <= 0) continue;
    const rule = game.pools.find((pool) => pool.key === request.pool);
    if (!rule) continue;
    if (rule.model === "nikki") {
      const worst = nikkiWorst(
        rule,
        request.copies,
        request.ownedPieces ?? 0,
        request.nikkiMode ?? "set",
        request.blessing ?? false,
      );
      worstPulls += worst;
      expectedPulls += worst;
      byPool.push({ pool: rule.key, label: rule.label, worst, expected: worst });
      continue;
    }
    const worst = worstRateup(rule, request.state, request.copies);
    const expected = expectedRateup(rule, request.state, request.copies);
    worstPulls += worst;
    expectedPulls += expected;
    byPool.push({ pool: rule.key, label: rule.label, worst, expected });
  }

  const pullsToBuy = Math.max(0, worstPulls - spend.inventoryPulls - spend.bonusPulls);
  const needCrystals = Math.ceil(pullsToBuy * game.currencyPerPull);
  const usable = filterPacks(game.packs, spend, false);
  const withMonthly = filterPacks(game.packs, spend, true);

  return {
    worstPulls,
    expectedPulls,
    pullsToBuy,
    instant: planSpend(needCrystals, usable),
    patient: spend.includeMonthly ? planSpend(needCrystals, withMonthly) : null,
    byPool,
    notes: [
      "花费按最坏抽数估算：先扣掉库存和你填的累充赠送，再买够剩下的。",
      "立刻买是直充、未用的首充双倍和示例礼包。月卡方案更便宜，但要按天领。",
      ...game.notes,
    ],
  };
}

function filterPacks(packs: ShopPack[], spend: SpendInput, monthly: boolean): ShopPack[] {
  return packs.filter((pack) => {
    if (pack.kind === "double") {
      return spend.useDoubles && !spend.usedDoubleIds.includes(pack.id);
    }
    if (pack.kind === "monthly") return monthly;
    if (pack.kind === "bundle") return spend.includeBundles;
    return true;
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
