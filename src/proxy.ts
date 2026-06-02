import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;
  const protectedPaths = ["/dashboard", "/lessons/new"];
  const isProtected =
    protectedPaths.some((p) => path === p || path.startsWith(`${p}/`)) ||
    /\/lessons\/[^/]+\/edit$/.test(path);

  if (isProtected && !isLoggedIn) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/lessons/new", "/lessons/:id/edit"],
};
