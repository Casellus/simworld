import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BYPASS = ["/coming-soon", "/admin", "/api", "/_next", "/favicon.ico", "/icon.svg", "/sponsors"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (BYPASS.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/coming-soon", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
