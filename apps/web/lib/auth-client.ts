import { createAuthClient } from "better-auth/react";
import {
  magicLinkClient,
  twoFactorClient,
} from "better-auth/client/plugins";

const baseURL =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
  plugins: [magicLinkClient(), twoFactorClient()],
});
