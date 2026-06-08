import "server-only";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { XP_VALUES, type XpAction } from "@/lib/constants";

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

/**
 * Assegna XP a un utente in modo idempotente.
 * L'anti-farming è garantito dalla funzione Postgres award_xp (UNIQUE su ledger).
 * Non lancia: gli errori XP non devono far fallire l'azione utente principale.
 */
export async function awardXp(
  userId: string,
  action: XpAction,
  refId: string,
): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.rpc("award_xp", {
      p_user_id: userId,
      p_action_type: action,
      p_ref_id: refId,
      p_amount: XP_VALUES[action],
    });
    if (error) {
      console.error("awardXp failed:", action, refId, error.message);
      return;
    }
    revalidatePath("/ranking");
  } catch (e) {
    console.error("awardXp threw:", e);
  }
}
