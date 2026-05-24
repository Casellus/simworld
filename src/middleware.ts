import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const COMING_SOON = true; // imposta false per riaprire il sito

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (COMING_SOON && pathname !== "/coming-soon" && !pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/coming-soon", request.url));
  }

  const response = await updateSession(request);
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
