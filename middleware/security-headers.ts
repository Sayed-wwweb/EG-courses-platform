import { NextResponse } from "next/server";

// Applied to every response the middleware touches. These four are safe
// to turn on unconditionally — they don't change how the site works,
// they only remove ways a *different* site could misuse it.
//
// Deliberately NOT included: Content-Security-Policy. A CSP has to
// explicitly allow every external origin the app actually loads from
// (Google OAuth, the Bunny Stream iframe embed, Bunny CDN images, Resend,
// etc.) — getting that list wrong silently breaks those features instead
// of failing loudly. That's worth doing as its own deliberate, tested
// pass later, not bundled into this change.
export function withSecurityHeaders(response: NextResponse): NextResponse {
  // Stops other sites from embedding your pages in an <iframe> — the
  // classic defense against clickjacking (e.g. an invisible iframe of
  // your "Contact developer" or admin page laid over a fake button).
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  // Stops the browser from guessing a file's type from its content
  // instead of trusting the server's Content-Type header — prevents a
  // file someone uploads (a course thumbnail, say) from being
  // reinterpreted and executed as HTML/JS if it ever gets served
  // cross-origin.
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Controls what's sent in the Referer header when a user clicks a link
  // away from your site. "strict-origin-when-cross-origin" sends the
  // full URL to same-site requests, but only the bare origin (no path,
  // no query string) to other sites — so a link to WhatsApp/Discord from
  // the contact-developer dialog doesn't leak which specific course page
  // the student was on.
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Explicitly denies browser features the site never uses. Costs
  // nothing, closes off camera/mic/location access a compromised
  // third-party script embedded on the page could otherwise attempt.
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}