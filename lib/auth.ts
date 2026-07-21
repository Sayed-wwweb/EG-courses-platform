import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from "better-auth/plugins";
import { resend } from "./resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Exposes the Prisma `role` field on session.user. Without this,
  // Better Auth doesn't know the field exists, so session.user.role is
  // always undefined even though it's set correctly in the database.
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "STUDENT",
        // input: false means it can't be set via the signup request body —
        // role changes only happen server-side (e.g. becomeInstructor()).
        input: false,
      },
    },
  },

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        const { error } = await resend.emails.send({
          from: "elsayed platform <onboarding@resend.dev>",
          to: [email],
          subject: "elsayed says verify your email",
          html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
        });

        if (error) {
          console.error("Error sending OTP email:", error);
          throw new Error(`Failed to send OTP email: ${error.message}`);
        }
      },
    }),
  ],
});