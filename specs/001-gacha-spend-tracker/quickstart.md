# Quickstart

## Prerequisites
- Docker Desktop
- Node 24+（本地 `npm run` 可选）

## Run with Compose
```bash
cp .env.example .env
docker compose up --build
```
打开 http://localhost:3000

## Seed
Compose 启动时或手动：
```bash
npx prisma db push
npx prisma db seed
```

## Smoke checks
1. 首页五个游戏入口
2. 打开原神 → 目标 1 UP → 看到 90/180 与花费方案
3. 注册登录 → 保存进度 → 刷新仍在
