# Data Model

## Game
- `id`, `slug` (genshin|hsr|zzz|lads|nikki), `name`, `bgArtUrl?`, `mechanicsJson`（池参数）

## PullableItem
- `id`, `gameId`, `kind` (character|weapon|light_cone|wengine|memory|outfit_set|outfit_piece)
- `name`, `rarity`, `maxCopies`, `imageUrl?`, `metaJson?`

## ShopOffer
- `id`, `gameId`, `name`, `priceCny`, `pullsGranted`（或货币量+换算率）
- `offerType` (topup|first_double|monthly|bp|bundle|custom)
- `tierKey?`（双倍档键）, `limitPerAccount?`, `active`

## User
- `id`, `username`, `email?`, `passwordHash`, `createdAt`

## UserGameProgress
- `id`, `userId`, `gameId`
- `pityCount`, `guaranteed` (bool), `epitomized`/`targeted` progress
- `ownedJson`（目标 id → 份数）
- `inventoryPulls`, `usedDoubleTiersJson`, `extraJson`
- unique `(userId, gameId)`

## Session
- 可不落库：签名 cookie 含 `userId` + 过期
