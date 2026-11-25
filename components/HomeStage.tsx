"use client";

import Link from "next/link";
import { useState } from "react";
import { games } from "@/lib/catalog";

export function HomeStage() {
  const [active, setActive] = useState(0);
  const current = games[active];

  return (
    <div className="stage">
      <div className="strips">
        {games.map((game, index) => (
          <Link
            key={game.slug}
            href={`/games/${game.slug}`}
            className={index === active ? "strip on" : "strip"}
            style={{ backgroundImage: `url(${game.coverUrl})`, borderBottomColor: game.accent }}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
          >
            <span className="vname">{game.name}</span>
          </Link>
        ))}
      </div>
      <footer className="stage-foot">
        <span className="idx">{active + 1}</span>
        <div className="foot-copy">
          <span className="foot-kicker">ENTER</span>
          <span className="foot-title">{current.name}</span>
        </div>
      </footer>
    </div>
  );
}
