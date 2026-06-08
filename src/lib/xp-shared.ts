// Pure rank helpers — safe to import in both client and server components.
// No "server-only" here (the badge popup is a client component).

export const RANKS = [
  { rank: "Bronzo", minXp: 0, emoji: "🥉" },
  { rank: "Argento", minXp: 500, emoji: "🥈" },
  { rank: "Oro", minXp: 1200, emoji: "🥇" },
  { rank: "Leggenda", minXp: 2500, emoji: "👑" },
] as const;

export function calcRank(xp: number): string {
  let result: string = RANKS[0].rank;
  for (const r of RANKS) {
    if (xp >= r.minXp) result = r.rank;
  }
  return result;
}

export function rankEmoji(rank: string | null | undefined): string {
  return RANKS.find((r) => r.rank === rank)?.emoji ?? "🥉";
}
