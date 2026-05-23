import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { userId } = await req.json();
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ confirmed: false });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !data?.user) {
    return NextResponse.json({ confirmed: false });
  }

  return NextResponse.json({ confirmed: !!data.user.email_confirmed_at });
}
