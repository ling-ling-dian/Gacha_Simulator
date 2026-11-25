# API Contracts (v1)

## POST /api/auth/register
Body: `{ username, password, email? }` → `{ user: { id, username } }`  
Errors: 409 username taken, 400 validation

## POST /api/auth/login
Body: `{ username, password }` → Set-Cookie session + `{ user }`

## POST /api/auth/logout
Clears session cookie

## GET /api/auth/me
→ `{ user }` or 401

## GET /api/games
→ `{ games: [{ slug, name, bgArtUrl }] }`

## GET /api/games/:slug
→ game + items + shop offers + mechanics

## POST /api/calc
Body:
```json
{
  "game": "genshin",
  "pool": "character",
  "targets": [{ "itemId": "...", "copies": 1 }],
  "progress": {
    "pityCount": 0,
    "guaranteed": false,
    "fatePoints": 0,
    "inventoryPulls": 0,
    "usedDoubleTiers": [],
    "capturingRadiance": false
  },
  "spendOptions": {
    "useFirstDouble": true,
    "allowMonthly": true,
    "allowBundles": true,
    "accrualBonusPulls": 0
  }
}
```
→ `{ pullsNeededWorst, pullsNeededExpected, pullsAfterInventory, costCnyMin, plan: [{ offerId, name, qty, priceCny }], notes: string[] }`

## GET/PUT /api/progress/:gameSlug
Auth required. PUT body = progress snapshot; GET returns saved snapshot.
