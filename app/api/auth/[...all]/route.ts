import { auth } from "@/lib/auth";
import arcjet, {
  type ArcjetDecision,
  type BotOptions,
  type EmailOptions,
  type ProtectSignupOptions,
  type SlidingWindowRateLimitOptions,
  detectBot,
  protectSignup,
  shield,
  slidingWindow,
} from "@arcjet/next";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

const arcjetClient = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["userId"],
  rules: [
    shield({
      mode: "LIVE",
    }),
  ],
});

const emailOptions = {
  mode: "LIVE",
  deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
} satisfies EmailOptions;

const botOptions = {
  mode: "LIVE",
  allow: [],
} satisfies BotOptions;

const rateLimitOptions = {
  mode: "LIVE",
  interval: "2m",
  max: 5,
} satisfies SlidingWindowRateLimitOptions<[]>;

const signupOptions = {
  email: emailOptions,
  bots: botOptions,
  rateLimit: rateLimitOptions,
} satisfies ProtectSignupOptions<[]>;

async function protect(req: NextRequest): Promise<ArcjetDecision> {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const userId = session?.user?.id ? session.user.id : "anonymous";
  const path = new URL(req.url).pathname;

  if (path === "/api/auth/sign-up/email") {
    const body = await req.clone().json().catch(() => ({}));
    if (typeof body.email === "string") {
      return arcjetClient
        .withRule(protectSignup(signupOptions))
        .protect(req, { email: body.email, userId });
    }
  }

  if (path === "/api/auth/sign-in/email") {
    return arcjetClient
      .withRule(detectBot(botOptions))
      .withRule(slidingWindow(rateLimitOptions))
      .protect(req, { userId });
  }

  return arcjetClient
    .withRule(detectBot(botOptions))
    .protect(req, { userId });
}

const betterAuthHandler = toNextJsHandler(auth);

export async function GET(req: NextRequest) {
  return betterAuthHandler.GET(req);
}

export async function POST(req: NextRequest) {
  const decision = await protect(req);

  if (decision.isDenied()) {
    return new Response("Forbidden", { status: 403 });
  }

  return betterAuthHandler.POST(req);
}