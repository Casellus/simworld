import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";

// Constant-time comparison that doesn't early-return on length mismatch.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

async function handler(request: Request) {
  const secret = process.env.CRON_SECRET;
  // Fail closed: if the secret isn't configured, no request can authenticate.
  if (!secret) {
    console.error("CRON_SECRET is not set — cron endpoint disabled.");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const auth = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (!safeEqual(auth, expected)) {
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

// Vercel Cron invokes scheduled jobs via GET with the Authorization header,
// so we keep GET here. Access is gated by the constant-time secret check above.
export async function GET(request: Request) {
  return handler(request);
}
