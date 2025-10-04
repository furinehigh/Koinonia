// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // you might pass `secureCookie: process.env.NODE_ENV === "production"`
  });

  const isAuthPath = req.nextUrl.pathname.startsWith("/api/auth");
  const isProtected = req.nextUrl.pathname.startsWith("/dashboard");

  if (!token && isProtected) {
    // not logged in and trying to access protected route
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  if (token && isAuthPath) {
    // if logged in but trying to access login/signup again
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/auth/:path*"],
};
