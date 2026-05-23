import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();

  // Show current state
  const { data: all } = await supabase
    .from("setups")
    .select("id, title, setup_type, car, track")
    .order("created_at", { ascending: false });

  // Fix: set setup_type = 'auto' for all rows where it's NULL
  const { data: fixed, error } = await supabase
    .from("setups")
    .update({ setup_type: "auto" })
    .is("setup_type", null)
    .select("id, title");

  return NextResponse.json({
    total: all?.length,
    all_setups: all,
    fixed_count: fixed?.length ?? 0,
    fixed_ids: fixed?.map((s) => s.title),
    fix_error: error?.message ?? null,
  });
}
