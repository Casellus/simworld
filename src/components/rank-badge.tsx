import Link from "next/link";
import { rankEmoji } from "@/lib/xp";

export function RankBadge({ rank }: { rank: string | null | undefined }) {
  return (
    <Link
      href="/ranking"
      title={`Rank: ${rank ?? "Bronzo"} — vedi classifica`}
      className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-white/[0.08] transition-colors text-lg leading-none"
      aria-label={`Rank ${rank ?? "Bronzo"}, vai alla classifica`}
    >
      <span role="img" aria-hidden="true">{rankEmoji(rank)}</span>
    </Link>
  );
}
