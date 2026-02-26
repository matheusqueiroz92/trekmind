import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";
import { twoFactor } from "better-auth/plugins/two-factor";
import {
  db,
  user,
  session,
  account,
  verification,
} from "@trekmind/infrastructure";

const baseURL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  plugins: [
    nextCookies(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // TODO: integrate with your email provider (Resend, SendGrid, etc.)
        console.log("[Better Auth] Magic link for", email, "->", url);
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
