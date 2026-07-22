import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    ARCJET_KEY: z.string().min(1),
    ARCJET_ENV: z.string().min(1),
    BUNNY_STORAGE_ZONE: z.string().min(1),
    BUNNY_STORAGE_PASSWORD: z.string().min(1),
    BUNNY_STORAGE_HOSTNAME: z.string().min(1),
    BUNNY_STREAM_LIBRARY_ID: z.string().min(1),
    BUNNY_STREAM_API_KEY: z.string().min(1),
    BUNNY_STREAM_TRAILER_LIBRARY_ID: z.string().min(1),
    BUNNY_STREAM_TRAILER_API_KEY: z.string().min(1),
    BUNNY_WEBHOOK_SECRET: z.string().min(1),
    // Must be a 32-byte key, hex-encoded (64 hex characters). Generate with:
    // openssl rand -hex 32
    PAYOUT_ENCRYPTION_KEY: z.string().length(64),
    PAYMOB_SECRET_KEY: z.string().min(1),
    PAYMOB_PUBLIC_KEY: z.string().min(1),
    PAYMOB_HMAC_SECRET: z.string().min(1),
    PAYMOB_CARD_INTEGRATION_ID: z.string().min(1),
    PAYMOB_WALLET_INTEGRATION_ID: z.string().min(1),
    PAYMOB_KIOSK_INTEGRATION_ID: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_BUNNY_CDN_URL: z.string().min(1),
    NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BUNNY_CDN_URL: process.env.NEXT_PUBLIC_BUNNY_CDN_URL,
    NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME:
      process.env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME,
  },
});