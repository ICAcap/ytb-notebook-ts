/**
 * Configures the authentication system using better-auth with a Prisma adapter
 * and Google OAuth provider.
 */
import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { prisma } from "./src/lib/prisma";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		},
	},
	plugins: [inferAdditionalFields()],
});

export type Session = typeof auth.$Infer.Session;
