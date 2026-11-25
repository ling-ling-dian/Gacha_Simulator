"use client";

import { useEffect, useMemo, useState } from "react";
import type { GameDef } from "@/lib/catalog";
import { solve, type PoolState } from "@/lib/calc/engine";

type Target = { on: boolean; owned: number; want: number };
type PoolForm = PoolState & { ownedPieces: number; nikkiMode: "set" | "piece"; blessing: boolean };

const emptyPool = (): PoolForm => ({
  pity: 0,
  guaranteed: false,
  lossCycles: 0,
  ownedPieces: 0,
  nikkiMode: "set",
  blessing: true,
});

export function Calculator({ game }: { game: GameDef }) {
  const [targets, setTargets] = useState<Record<string, Target>>(() => {
    const initial: Record<string, Target> = {};
    game.items.forEach((entry, index) => {
      initial[entry.id] = { on: index === 0, owned: 0, want: 1 };
    });
    return initial;
  });
  const [pools, setPools] = useState<Record<string, PoolForm>>(() =>
    Object.fromEntries(game.pools.map((pool) => [pool.key, emptyPool()])),
  );
  const [inventoryPulls, setInventoryPulls] = useState(0);
  const [bonusPulls, setBonusPulls] = useState(0);
  const [useDoubles, setUseDoubles] = useState(true);
  const [includeMonthly, setIncludeMonthly] = useState(true);
  const [includeBundles, setIncludeBundles] = useState(true);
  const [usedDoubleIds, setUsedDoubleIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/progress/${game.slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const payload = data?.progress;
        if (!payload) return;
        if (payload.targets) setTargets(payload.targets);
        if (payload.pools) setPools(payload.pools);
        if (typeof payload.inventoryPulls === "number") setInventoryPulls(payload.inventoryPulls);
        if (typeof payload.bonusPulls === "number") setBonusPulls(payload.bonusPulls);
        if (Array.isArray(payload.usedDoubleIds)) setUsedDoubleIds(payload.usedDoubleIds);
      })
      .catch(() => undefined);
  }, [game.slug]);

  const result = useMemo(() => {
    const requests = game.pools.map((pool) => {
      const form = pools[pool.key] ?? emptyPool();
      const copies = game.items
        .filter((entry) => entry.pool === pool.key && targets[entry.id]?.on)
        .reduce((sum, entry) => sum + Math.max(0, (targets[entry.id]?.want ?? 0) - (targets[entry.id]?.owned ?? 0)), 0);
      return {
        pool: pool.key,
        copies: pool.model === "nikki" && form.nikkiMode === "piece" ? (copies > 0 ? 1 : 0) : copies,
        state: form,
        ownedPieces: form.ownedPieces,
        nikkiMode: form.nikkiMode,
        blessing: form.blessing,
      };
    });
    return solve(game, requests, {
      useDoubles,
      usedDoubleIds,
      includeMonthly,
      includeBundles,
      inventoryPulls,
      bonusPulls,
    });
  }, [bonusPulls, game, includeBundles, includeMonthly, inventoryPulls, pools, targets, useDoubles, usedDoubleIds]);

  function patchTarget(id: string, patch: Partial<Target>) {
    setTargets((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  }

  function patchPool(key: string, patch: Partial<PoolForm>) {
    setPools((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
  }

  function fill(mode: "max" | "one" | "clear") {
    setTargets((current) => {
      const next = { ...current };
      for (const entry of game.items) {
        if (mode === "clear") next[entry.id] = { ...next[entry.id], on: false, want: 0 };
        if (mode === "one") next[entry.id] = { ...next[entry.id], on: true, want: Math.max(1, next[entry.id].owned) };
        if (mode === "max") next[entry.id] = { ...next[entry.id], on: true, want: entry.maxCopies };
      }
      return next;
    });
  }

  async function save() {
    setMessage("");
    const res = await fetch(`/api/progress/${game.slug}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ targets, pools, inventoryPulls, bonusPulls, usedDoubleIds }),
    });
    setMessage(res.ok ? "进度已保存" : "没保存成。先登录，或者数据库还没起来。");
  }

  const doubles = game.packs.filter((pack) => pack.kind === "double");

  return (
    <main className="wrap">
      <h1 style={{ color: game.accent }}>{game.name}</h1>
      <section className="result" style={{ borderColor: game.accent }}>
        <h2>最坏还要抽</h2>
        <div className="big">{result.worstPulls} 抽</div>
        <p className="sub">期望大约 {Math.round(result.expectedPulls)} 抽（估算，软保底不是逐抽公式）</p>
        <p className="sub">扣掉库存和累充赠送后，还要买 {result.pullsToBuy} 抽</p>
        <p className="big">立刻买 ¥{result.instant.costCny}</p>
        <ul className="plan">
          {result.instant.lines.length === 0 ? <li>不用再花钱</li> : result.instant.lines.map((line) => (
            <li key={line.id}>{line.name} × {line.qty} · ¥{line.priceCny}</li>
          ))}
        </ul>
        {result.patient ? (
          <p className="sub">若能等月卡领完：¥{result.patient.costCny}（{result.patient.lines.map((line) => `${line.name}×${line.qty}`).join("，") || "不用买"}）</p>
        ) : null}
        <div className="actions">
          <button onClick={save}>保存到账号</button>
          <span className="muted">{message || "不登录也能算。登录后才能记下这页的进度。"}</span>
        </div>
      </section>

      <section className="panel">
        <h2>目标</h2>
        <div className="actions">
          <button className="ghost" onClick={() => fill("one")}>全部按 1 份</button>
          <button className="ghost" onClick={() => fill("max")}>全部满阶</button>
          <button className="ghost" onClick={() => fill("clear")}>清空</button>
        </div>
        {game.items.map((entry) => (
          <div className="item" key={entry.id}>
            <input type="checkbox" checked={targets[entry.id]?.on ?? false} onChange={(e) => patchTarget(entry.id, { on: e.target.checked })} />
            <span>
              {entry.imageUrl ? <img className="thumb" src={entry.imageUrl} alt="" /> : null}
              {entry.name}
              <span className="muted"> · 满 {entry.maxCopies}</span>
            </span>
            <label className="field">已有
              <input type="number" min={0} max={entry.maxCopies} value={targets[entry.id]?.owned ?? 0} onChange={(e) => patchTarget(entry.id, { owned: Number(e.target.value) })} />
            </label>
            <label className="field">想要
              <input type="number" min={0} max={entry.maxCopies} value={targets[entry.id]?.want ?? 0} onChange={(e) => patchTarget(entry.id, { want: Number(e.target.value) })} />
            </label>
          </div>
        ))}
      </section>

      {game.pools.map((pool) => {
        const form = pools[pool.key] ?? emptyPool();
        return (
          <section className="panel" key={pool.key}>
            <h2>{pool.label}</h2>
            <div className="row">
              <label className="field">已垫抽数
                <input type="number" min={0} max={pool.hardPity - 1} value={form.pity} onChange={(e) => patchPool(pool.key, { pity: Number(e.target.value) })} />
              </label>
              {pool.model === "nikki" ? (
                <>
                  <label className="field">已有部件
                    <input type="number" min={0} max={pool.setSize ?? 9} value={form.ownedPieces} onChange={(e) => patchPool(pool.key, { ownedPieces: Number(e.target.value) })} />
                  </label>
                  <label className="field">算法
                    <select value={form.nikkiMode} onChange={(e) => patchPool(pool.key, { nikkiMode: e.target.value as "set" | "piece" })}>
                      <option value="set">凑整套</option>
                      <option value="piece">只要指定一件</option>
                    </select>
                  </label>
                </>
              ) : null}
            </div>
            <div className="checks">
              <label><input type="checkbox" checked={form.guaranteed} onChange={(e) => patchPool(pool.key, { guaranteed: e.target.checked })} /> 下一发五星必出目标</label>
              {pool.radianceAfterCycles ? (
                <label className="field">已连续歪保底次数
                  <input type="number" min={0} max={pool.radianceAfterCycles} value={form.lossCycles} onChange={(e) => patchPool(pool.key, { lossCycles: Number(e.target.value) })} />
                </label>
              ) : null}
              {pool.model === "nikki" ? (
                <label><input type="checkbox" checked={form.blessing} onChange={(e) => patchPool(pool.key, { blessing: e.target.checked })} /> 海风的祝颂还没用</label>
              ) : null}
            </div>
          </section>
        );
      })}

      <section className="panel">
        <h2>手里的资源和氪金</h2>
        <div className="row">
          <label className="field">库存抽数
            <input type="number" min={0} value={inventoryPulls} onChange={(e) => setInventoryPulls(Number(e.target.value))} />
          </label>
          <label className="field">累充/活动白送抽
            <input type="number" min={0} value={bonusPulls} onChange={(e) => setBonusPulls(Number(e.target.value))} />
          </label>
        </div>
        <div className="checks">
          <label><input type="checkbox" checked={useDoubles} onChange={(e) => setUseDoubles(e.target.checked)} /> 首充双倍还能用</label>
          <label><input type="checkbox" checked={includeMonthly} onChange={(e) => setIncludeMonthly(e.target.checked)} /> 对比月卡方案</label>
          <label><input type="checkbox" checked={includeBundles} onChange={(e) => setIncludeBundles(e.target.checked)} /> 计入示例礼包</label>
        </div>
        <div className="checks">
          {doubles.map((pack) => (
            <label key={pack.id}>
              <input
                type="checkbox"
                checked={usedDoubleIds.includes(pack.id)}
                onChange={(e) => setUsedDoubleIds((current) => e.target.checked ? [...current, pack.id] : current.filter((id) => id !== pack.id))}
              />
              {pack.name}已用过
            </label>
          ))}
        </div>
      </section>

      <section className="panel notes">
        <h2>这页怎么算的</h2>
        <ul>
          {result.byPool.map((row) => (
            <li key={row.pool}>{row.label}：最坏 {row.worst} 抽，期望约 {Math.round(row.expected)} 抽</li>
          ))}
          {result.notes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      </section>
    </main>
  );
}
