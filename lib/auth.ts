/**
 * Configures the authentication system using better-auth with a Prisma adapter
 * and Google OAuth provider.
 * https://tomdekan.com/articles/google-sign-in-nextjs
 */
import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { prisma } from "./prisma";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
	throw new Error("Google OAuth credentials missing");
}

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		},
	},
	account: {
		encryptOAuthTokens: true,
	},
	user: {
		additionalFields: { isSuper: { type: "boolean", input: false } },
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 30 * 60, // Cache duration in seconds
		},
	},
	plugins: [inferAdditionalFields()],
});

export type Session = typeof auth.$Infer.Session;
