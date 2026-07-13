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

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        try {
          const { data, error } = await resend.emails.send({
            from: "elsayed platform <onboarding@resend.dev>",
            to: [email],
            subject: "elsayed says verify your email",
            html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
          });
        } catch (error) {
          console.error("Error sending OTP email:", error);
        }
      },
    }),
  ],
});