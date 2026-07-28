import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { isProtectedRoute } from "./middleware/protected-routes";
import { withSecurityHeaders } from "./middleware/security-headers";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isProtectedRoute(pathname)) {
    // getSessionCookie only checks that a validly-shaped session cookie
    // is present — it does NOT hit the database (middleware runs on the
    // Edge runtime, which can't reach Postgres). It answers "is someone
    // logged in at all", not "what role are they" or "is this session
    // still valid server-side". The real, authoritative checks —
    // including the STUDENT / INSTRUCTOR / ADMIN role check — still run
    // afterwards in app/instructor/layout.tsx and app/admin/layout.tsx.
    //
    // What this adds: right now, forgetting to add a session check to a
    // *new* protected route's layout would leave it wide open. This
    // catches "not logged in" centrally, in one place, before any page
    // code runs — a safety net, not a replacement for the layout checks.
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname + search);
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  // Runs on every route except static assets and the favicon — includes
  // API routes too, since the security headers above are harmless (and
  // useful) on JSON responses as well as pages.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};