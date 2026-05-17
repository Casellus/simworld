import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // Elimina eventi con end_at passata
  const { count: c1 } = await supabase
    .from("events")
    .delete({ count: "exact" })
    .not("end_at", "is", null)
    .lt("end_at", now);

  // Elimina eventi senza end_at dove start_at è passata
  const { count: c2 } = await supabase
    .from("events")
    .delete({ count: "exact" })
    .is("end_at", null)
    .lt("start_at", now);

  return NextResponse.json({ deleted: (c1 ?? 0) + (c2 ?? 0) });
}
