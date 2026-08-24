import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const isAdmin = (req.auth?.user as { role?: string })?.role === "admin";

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return Response.redirect(loginUrl);
    }
    if (!isAdmin) {
      return Response.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
