# Research: Gacha Spend Tracker

## R1 — Pity models (decision)

**Decision**: 以硬保底路径输出「规划最坏抽数」；期望抽数用简化模型（角色池约 0.5 命中率或捕获明光综合约 0.55；武器/光锥/音擎 0.75；恋与深空单人 0.5 / 多人 0.75+定向；暖暖 20×剩余部件 − 海风抵扣）。

**Rationale**: 官方软保底曲线未完全公开或因版本变化；硬保底可验收。

**Alternatives**: 完整 Monte Carlo — 首版不做。

## R2 — Game rules snapshot (2026-11)

| Game | Character-like | Weapon/equip | Max copies |
|---|---|---|---|
| Genshin | 90 / 50-50 + 捕获明光；定轨武器 80 / 命定 1 | 满命 7；精 5 |
| HSR | 90 / 50-50；光锥 80 / 75% | 星魂 6；叠影 5 |
| ZZZ | 独家 90 / 50%；音擎 80 / 75% | 特写满阶按 7 份计 |
| LADS | 70；单人 50%；多人 75%+定向 | 思念进阶另表 |
| Infinity Nikki | 20/件，保新，套装约 9 件；海风前 5 金自选 | 整套 / 升阶另计 |

## R3 — Monetization

米三家：直充档 + 首充双倍按档 + 小月卡 30 + 纪行/大月卡 + 活动礼包。  
叠纸：钻石/晶珀档 + 月卡/密约类礼包。  
**Decision**: `ShopOffer` 表驱动；方案搜索 = 背包式凑齐「还差抽数」的最低人民币组合（贪心 + 有限枚举双倍档）。

## R4 — Auth

**Decision**: Credentials（用户名+密码）+ httpOnly session cookie（jose 签名）。  
**Alternatives**: NextAuth OAuth — 延后。

## R5 — Docker

**Decision**: Compose 服务 `db`（mysql:8）+ `web`（next）。开发可用 `DATABASE_URL` 指向本机已有 `my-mysql-dev`。
