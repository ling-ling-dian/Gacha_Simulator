import { PrismaClient } from "@prisma/client";
import { games } from "../lib/catalog";

const prisma = new PrismaClient();

async function main() {
  for (const game of games) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      create: {
        id: game.slug,
        slug: game.slug,
        name: game.name,
        bgArtUrl: game.bgArtUrl,
        currencyName: game.currencyName,
        currencyPerPull: game.currencyPerPull,
        notesJson: game.notes,
      },
      update: {
        name: game.name,
        bgArtUrl: game.bgArtUrl,
        currencyName: game.currencyName,
        currencyPerPull: game.currencyPerPull,
        notesJson: game.notes,
      },
    });

    for (const entry of game.items) {
      await prisma.pullableItem.upsert({
        where: { id: entry.id },
        create: {
          id: entry.id,
          gameId: game.slug,
          pool: entry.pool,
          kind: entry.kind,
          name: entry.name,
          rarity: entry.rarity,
          maxCopies: entry.maxCopies,
          imageUrl: entry.imageUrl ?? null,
        },
        update: {
          pool: entry.pool,
          kind: entry.kind,
          name: entry.name,
          rarity: entry.rarity,
          maxCopies: entry.maxCopies,
          imageUrl: entry.imageUrl ?? null,
        },
      });
    }

    for (const pack of game.packs) {
      await prisma.shopOffer.upsert({
        where: { id: pack.id },
        create: {
          id: pack.id,
          gameId: game.slug,
          name: pack.name,
          priceCny: pack.priceCny,
          crystals: pack.crystals,
          kind: pack.kind,
          maxQty: pack.maxQty,
          note: pack.note,
        },
        update: {
          name: pack.name,
          priceCny: pack.priceCny,
          crystals: pack.crystals,
          kind: pack.kind,
          maxQty: pack.maxQty,
          note: pack.note,
        },
      });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
