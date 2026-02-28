import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";
import { twoFactor } from "better-auth/plugins/two-factor";
import { Resend } from "resend";
import {
  db,
  user,
  session,
  account,
  verification,
} from "@trekmind/infrastructure";
import { logger } from "@/lib/logger";

const baseURL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const resendApiKey = process.env.RESEND_API_KEY?.trim();
const resendFrom =
  process.env.RESEND_FROM ?? "TrekMind <onboarding@resend.dev>";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        if (resend) {
          const { error } = await resend.emails.send({
            from: resendFrom,
            to: email,
            subject: "Seu link de acesso — TrekMind",
            html: `Clique no link para entrar: <a href="${url}">${url}</a>. O link expira em alguns minutos.`,
          });
          if (error) {
            logger.error("Better Auth: Resend error", { error });
            throw new Error("Falha ao enviar e-mail.");
          }
        } else {
          logger.info("Magic link (no Resend)", { email });
        }
      },
    }),
    twoFactor(),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  basePath: "/api/auth",
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.JWT_SECRET,
  trustedOrigins: [baseURL],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    },
  },
});
