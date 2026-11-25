# Gacha Simulator Constitution

## Core Principles

### I. Calculator-First Product
主交付是「目标物品 → 所需抽数 / 花费 / 氪金方案」。抽卡规则与商品表必须可配置、可验证；页面按游戏分区，计算器结果始终处于首屏显眼位置。记录进度与登录是支撑能力，不得压过主功能。

### II. Mechanism Accuracy Over Guesswork
五款游戏（原神、星穹铁道、绝区零、恋与深空、无限暖暖）的保底、UP、定轨/定向、满命/满精/套装部件标准，以官方公示与可信 wiki 为准写入数据层。未知处显式标注假设与版本；禁止用错误默认值 silently 冒充精确结果。

### III. Simplest Complete Stack
技术栈固定为 Next.js + MySQL + Docker。优先最简完整实现：可注册登录、可算、可存进度。不为假想消费者保留兼容层；不为未来功能预建抽象。图片与立绘只留字段与渲染接口，首版纯文字。

### IV. Verifiable Outcomes
计算器输出至少包含：最坏抽数、期望抽数（在规则可建模时）、对应人民币方案（含首充双倍、月卡、礼包、累充输入）。关键规则用单元测试或可复现样例核对；启动后 Docker Compose 能拉起应用与数据库。

### V. Honest Scope Growth
先做端到端最小可用（单游戏可算 → 五游戏齐 → 方案优化），再加美化与素材。变更必须服务当前需求；发现机制错误优先修数据与公式，不顺手重构无关模块。

## Technology Constraints

- 前端与 API：Next.js（App Router）
- 持久化：MySQL（Docker 容器；可复用本机已有 `my-mysql-dev` 或 Compose 新实例）
- 部署/本地运行：Docker Compose
- 敏感配置：`.env` 不入库；提供 `.env.example`
- 媒体：`imageUrl` / `bgArtUrl` 等可空字段预留，首版不强制素材

## Development Workflow

1. Spec Kit：specify → clarify（必要时）→ plan → tasks → analyze → implement → converge
2. 需求变更先进 spec，再改实现
3. 游戏规则变更以种子数据 / 机制配置为准，避免散落硬编码

## Governance

Constitution 约束本仓库实现优先级与边界。修订须更新版本号与修订日期，并说明影响范围。与全局协作规则冲突时，安全与凭据门优先；产品范围内以本文件为准。

**Version**: 1.0.0 | **Ratified**: 2026-11-25 | **Last Amended**: 2026-11-25
