import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { XP_VALUES, type XpAction } from "@/lib/constants";

// re-export pure helpers so existing server imports of "@/lib/xp" keep working
export { RANKS, calcRank, rankEmoji } from "@/lib/xp-shared";

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
    }
  } catch (e) {
    console.error("awardXp threw:", e);
  }
}
