import { readFileSync } from "fs";
import { games } from "../lib/catalog";
import { query, sqlValue } from "../lib/db";

async function main() {
  const sql = readFileSync(new URL("./init.sql", import.meta.url), "utf8");
  for (const statement of sql.split(";").map((part) => part.trim()).filter(Boolean)) {
    await query(statement);
  }

  for (const game of games) {
    await query(
      `INSERT INTO games (slug, name, bg_art_url, currency_name, currency_per_pull, notes_json)
       VALUES (${sqlValue(game.slug)}, ${sqlValue(game.name)}, ${sqlValue(game.bgArtUrl)}, ${sqlValue(game.currencyName)}, ${sqlValue(game.currencyPerPull)}, ${sqlValue(JSON.stringify(game.notes))})
       ON DUPLICATE KEY UPDATE name = VALUES(name), bg_art_url = VALUES(bg_art_url),
         currency_name = VALUES(currency_name), currency_per_pull = VALUES(currency_per_pull), notes_json = VALUES(notes_json)`,
    );
    for (const entry of game.items) {
      await query(
        `INSERT INTO pullable_items (id, game_slug, pool, kind, name, rarity, max_copies, image_url)
         VALUES (${sqlValue(entry.id)}, ${sqlValue(game.slug)}, ${sqlValue(entry.pool)}, ${sqlValue(entry.kind)}, ${sqlValue(entry.name)}, ${sqlValue(entry.rarity)}, ${sqlValue(entry.maxCopies)}, ${sqlValue(entry.imageUrl ?? null)})
         ON DUPLICATE KEY UPDATE name = VALUES(name), pool = VALUES(pool), kind = VALUES(kind),
           rarity = VALUES(rarity), max_copies = VALUES(max_copies), image_url = VALUES(image_url)`,
      );
    }
    for (const pack of game.packs) {
      await query(
        `INSERT INTO shop_offers (id, game_slug, name, price_cny, crystals, kind, max_qty, note)
         VALUES (${sqlValue(pack.id)}, ${sqlValue(game.slug)}, ${sqlValue(pack.name)}, ${sqlValue(pack.priceCny)}, ${sqlValue(pack.crystals)}, ${sqlValue(pack.kind)}, ${sqlValue(pack.maxQty)}, ${sqlValue(pack.note ?? null)})
         ON DUPLICATE KEY UPDATE name = VALUES(name), price_cny = VALUES(price_cny), crystals = VALUES(crystals),
           kind = VALUES(kind), max_qty = VALUES(max_qty), note = VALUES(note)`,
      );
    }
  }
  const rows = await query("SELECT COUNT(*) FROM pullable_items");
  console.log(`seeded items=${rows[0]?.[0] ?? 0}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
