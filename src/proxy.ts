import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/middleware";

const ADMIN_EMAIL = "samuelcasella06@gmail.com";
const COMING_SOON_BYPASS = ["/coming-soon", "/api", "/sponsors"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/coming-soon", request.url));
    }
    const response = await updateSession(request);
    response.headers.set("x-pathname", pathname);
    return response;
  }

  if (!COMING_SOON_BYPASS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/coming-soon", request.url));
  }

  const response = await updateSession(request);
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
