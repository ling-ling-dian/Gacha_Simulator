# Implementation Plan: Gacha Spend Tracker

**Branch**: `001-gacha-spend-tracker` | **Date**: 2026-11-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-gacha-spend-tracker/spec.md`

## Summary

构建 Next.js + MySQL + Docker 的抽卡/氪金规划站：五游戏分页；首屏显眼计算器（目标 → 抽数 → 花费 → 购买方案）；可选登录保存进度；机制与商品进库；图片/立绘仅留接口。

## Technical Context

**Language/Version**: TypeScript 5.x, Node 24

**Primary Dependencies**: Next.js 15 (App Router), Prisma, bcrypt/jose 会话, Zod

**Storage**: MySQL 8（Docker Compose；可对接本机 `my-mysql-dev`）

**Testing**: Vitest（计算器纯函数）+ 手动 quickstart 验收

**Target Platform**: 本地 Docker / Windows 开发机浏览器

**Project Type**: 单体 Web 应用（Next.js full-stack）

**Performance Goals**: 单次计算 < 200ms；首屏可交互 < 3s（本地）

**Constraints**: 首版纯文字 UI；软保底用硬保底规划为主；累充可选手填

**Scale/Scope**: 5 游戏、种子级实体表、单用户进度 CRUD

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|---|---|
| Calculator-first UI | Pass — 游戏页首屏为结果面板 |
| Mechanism in data layer | Pass — mechanics JSON + shop offers in DB |
| Simplest complete stack | Pass — Next + Prisma + MySQL + Compose only |
| Verifiable outcomes | Pass — Vitest on pity/spend math |
| Honest scope | Pass — MVP 闭环后再扩图鉴 |

Post-design: 无违规。

## Project Structure

### Documentation (this feature)

```text
specs/001-gacha-spend-tracker/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
app/                      # Next.js App Router
  page.tsx                # 首页游戏入口
  games/[slug]/page.tsx  # 游戏页 + 计算器
  login/ register/
  api/auth/ api/calc/ api/progress/ api/games/
components/
  calculator/             # 结果面板、目标选择、进度表单
  layout/
lib/
  calc/                   # 各游戏保底与氪金方案
  auth/
  db.ts                   # Prisma client
prisma/
  schema.prisma
  seed.ts
docker-compose.yml
Dockerfile
.gitignore
.env.example
```

## Complexity Tracking

无超出宪法的额外复杂度；不做微服务、不做 OAuth、不做实时同步。
