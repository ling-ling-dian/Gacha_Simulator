import { describe, expect, it } from "vitest";
import { getGame } from "@/lib/catalog";
import { expectedRateup, nikkiWorst, planSpend, solve, worstRateup } from "@/lib/calc/engine";

const fresh = { pity: 0, guaranteed: false, lossCycles: 0 };

describe("pity", () => {
  const genshin = getGame("genshin")!;
  const character = genshin.pools[0];
  const weapon = genshin.pools[1];

  it("原神零进度单角色最坏 180", () => {
    expect(worstRateup(character, fresh, 1)).toBe(180);
  });

  it("原神大保底且已垫 70，最坏还差 20", () => {
    expect(worstRateup(character, { pity: 70, guaranteed: true, lossCycles: 0 }, 1)).toBe(20);
  });

  it("原神满命 7 份，捕获明光把最坏从 1260 压到 1170", () => {
    expect(worstRateup(character, fresh, 7)).toBe(1170);
  });

  it("武器定轨零进度最坏 160，已有命定则 80", () => {
    expect(worstRateup(weapon, fresh, 1)).toBe(160);
    expect(worstRateup(weapon, { pity: 0, guaranteed: true, lossCycles: 0 }, 1)).toBe(80);
  });

  it("期望低于最坏", () => {
    const worst = worstRateup(character, fresh, 1);
    const expected = expectedRateup(character, fresh, 1);
    expect(expected).toBeGreaterThan(40);
    expect(expected).toBeLessThan(worst);
  });
});

describe("nikki", () => {
  const rule = getGame("nikki")!.pools[0];

  it("空套装最坏 180", () => {
    expect(nikkiWorst(rule, 1, 0, "set", true)).toBe(180);
  });

  it("海风让指定单件最坏停在 100", () => {
    expect(nikkiWorst(rule, 1, 0, "piece", true)).toBe(100);
    expect(nikkiWorst(rule, 1, 0, "piece", false)).toBe(180);
  });
});

describe("spend", () => {
  const genshin = getGame("genshin")!;

  it("只差 1 抽时不会去买 648", () => {
    const result = solve(
      genshin,
      [{ pool: "character", copies: 1, state: { pity: 80, guaranteed: true, lossCycles: 0 } }],
      {
        useDoubles: true,
        usedDoubleIds: [],
        includeMonthly: false,
        includeBundles: false,
        inventoryPulls: 0,
        bonusPulls: 0,
      },
    );
    expect(result.worstPulls).toBe(10);
    expect(result.instant.costCny).toBeLessThan(100);
  });

  it("180 抽会用掉 648 双倍而不是只买原价", () => {
    const doubles = genshin.packs.filter((pack) => pack.kind === "double");
    const topups = genshin.packs.filter((pack) => pack.kind === "topup");
    const plan = planSpend(180 * 160, [...doubles, ...topups]);
    expect(plan.lines.some((line) => line.name.includes("648 元首充双倍"))).toBe(true);
    expect(plan.costCny).toBeLessThan(1944);
  });
});
