/**
 * Client-side authentication configuration.
 * Provides the `authClient` instance for managing sessions,
 * authentication requests, and type-safe session data across the application.
 */

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { nextCookies } from "better-auth/next-js";
import type { auth } from "./auth";

export const authClient = createAuthClient({
	plugins: [inferAdditionalFields<typeof auth>(), nextCookies()],
});

export type Session = typeof authClient.$Infer.Session;
