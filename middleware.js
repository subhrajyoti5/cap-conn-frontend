import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/sign-in", "/sign-up", "/pending"];

export default function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public routes and Next.js internals
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isPublic) return NextResponse.next();

  // Check cookie (set alongside localStorage on login)
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
