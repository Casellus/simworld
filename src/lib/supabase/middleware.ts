import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Forward pathname to server components so layout can read it via headers()
  const fwdHeaders = new Headers(request.headers);
  fwdHeaders.set("x-pathname", request.nextUrl.pathname);
  let response = NextResponse.next({ request: { headers: fwdHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getClaims() verifies the JWT locally (no network round-trip to Supabase),
  // while still refreshing the session cookie when needed. Much faster than getUser().
  await supabase.auth.getClaims();
  return response;
}
