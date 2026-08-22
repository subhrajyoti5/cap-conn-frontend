import { NextResponse } from "next/server";

const isPublicRoute = (request) => {
  const url = request.nextUrl.clone();
  const path = url.pathname;

  return (
    path === "/" ||
    path.startsWith("/sign-in") ||
    path.startsWith("/sign-up") ||
    path.startsWith("/pending") ||
    path.startsWith("/api/webhooks")
  );
};

export default function middleware(request) {
  const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
  const isAuthenticated = !!token;

  if (!isPublicRoute(request) && !isAuthenticated) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
