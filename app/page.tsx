import Link from "next/link";
import { games } from "@/lib/catalog";

export default function HomePage() {
  return (
    <main className="wrap">
      <h1>先算清再抽</h1>
      <p className="muted">
        五个游戏分开记。默认从 0 抽 0 氪开始，也可以填你已经垫了多少、歪没歪、双倍档用过没有。
        页面上最大的数字是：最坏还要抽多少，以及按这个抽数要花多少钱。
      </p>
      <div className="home-grid">
        {games.map((game) => (
          <Link key={game.slug} href={`/games/${game.slug}`} className="game-card" style={{ borderTopColor: game.accent }}>
            <strong>{game.name}</strong>
            <span className="muted">算抽数、算花费、存进度</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
