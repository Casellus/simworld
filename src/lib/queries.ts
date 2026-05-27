import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function anonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export const getGameIdBySlug = unstable_cache(
  async (slug: string): Promise<string | null> => {
    const { data } = await anonClient().from("games").select("id").eq("slug", slug).single();
    return data?.id ?? null;
  },
  ["game-id-by-slug"],
  { revalidate: 3600 }
);

export const getAllGameIds = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const { data } = await anonClient().from("games").select("id, slug");
    return Object.fromEntries((data ?? []).map((g) => [g.slug, g.id]));
  },
  ["all-game-ids"],
  { revalidate: 3600 }
);
