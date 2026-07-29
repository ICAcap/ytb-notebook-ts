/**
 * Client-side authentication configuration.
 * Provides the `authClient` instance for managing sessions,
 * authentication requests, and type-safe session data across the application.
 * https://tomdekan.com/articles/google-sign-in-nextjs
 */

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";
import { nextCookies } from "better-auth/next-js";
import type { auth } from "./auth";

export const authClient = createAuthClient({
	plugins: [
		inferAdditionalFields<typeof auth>(),
		nextCookies(),
		anonymousClient(),
	],
});

export type Session = typeof authClient.$Infer.Session;
