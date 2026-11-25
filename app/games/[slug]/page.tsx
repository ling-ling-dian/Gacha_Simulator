import { notFound } from "next/navigation";
import { Calculator } from "@/components/Calculator";
import { getGame } from "@/lib/catalog";

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();
  return (
    <div
      className="page-bg"
      style={game.bgArtUrl ? { backgroundImage: `linear-gradient(#12141acc, #12141af2), url(${game.bgArtUrl})` } : undefined}
    >
      <Calculator game={game} />
    </div>
  );
}
