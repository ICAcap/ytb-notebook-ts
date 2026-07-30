"use server";

import { prisma } from "../prisma";
import { User } from "../../generated/prisma";

// --------- DELETE DANGEROUS ------------------------------------------------------------------

/**
 * Dangerous operation, permanently deletes a user and all owned data
 * (videos, collections, notes, sessions, accounts) via Prisma cascade deletes.
 * @param userId - The unique identifier of the user to purge.
 * @returns A promise resolving to the deleted user record, or null on error.
 */
export const purgeUser = async function (
	userId: string,
): Promise<User | null> {
	if (!userId) {
		console.error("Error purging user, user ID is undefined");
		return null;
	}
	try {
		const deletedUser = await prisma.user.delete({ where: { id: userId } });
		return deletedUser;
	} catch (error) {
		console.error("User purge failed, fallback to return null", error);
		return null;
	}
};

/**
 * Dangerous operation, deletes anonymous demo accounts (and their cascaded
 * videos, collections, notes, sessions, accounts) older than 45 minutes.
 * Intended for scheduled/cron invocation, not automatic use.
 */
export const cleanDemoAccounts = async function () {
	try {
		// earlier than 45 mins ago considered to be expired
		const expiryDate = new Date(new Date().getTime() - 45 * 60 * 1000);

		await prisma.user.deleteMany({
			where: {
				isAnonymous: true,
				createdAt: {
					lt: expiryDate,
				},
			},
		});
	} catch (error) {
		console.error("Failed to clean demo accounts:", error);
	}
};
