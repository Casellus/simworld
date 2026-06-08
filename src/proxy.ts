import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const COMING_SOON_BYPASS = ["/coming-soon", "/admin", "/api", "/sponsors"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
