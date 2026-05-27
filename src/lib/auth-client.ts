/**
 * Client-side authentication configuration.
 * Provides the `authClient` instance for managing sessions,
 * authentication requests, and type-safe session data across the application.
 */

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

export const authClient = createAuthClient({
	plugins: [inferAdditionalFields<typeof auth>()],
});

export type Session = typeof authClient.$Infer.Session;
