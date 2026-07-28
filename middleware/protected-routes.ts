// Route prefixes that require a signed-in session. Matched with
// pathname.startsWith(prefix), so "/instructor" also covers
// "/instructor/courses/123/edit", "/admin" also covers "/admin/anything", etc.
//
// This list only decides "logged in or not" — it does NOT decide role
// (STUDENT vs INSTRUCTOR vs ADMIN). Role checks stay in
// app/instructor/layout.tsx and app/admin/layout.tsx, since middleware
// runs on the Edge runtime and can't query Postgres for the user's role.
const PROTECTED_PREFIXES = ["/admin", "/instructor", "/learn", "/library"];

// Routes that must match EXACTLY, not by prefix. "/profile" is the
// signed-in user's own profile page and needs a session, but
// "/profile/[userId]" is the public profile viewer that anyone —
// including logged-out visitors — can open. A prefix match would have
// wrongly swept the public one in too, so it's listed separately here.
const PROTECTED_EXACT = ["/profile"];

export function isProtectedRoute(pathname: string): boolean {
  if (PROTECTED_EXACT.includes(pathname)) return true;
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}