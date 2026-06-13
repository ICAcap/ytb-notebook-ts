"use server";

import { prisma } from "../prisma";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import { Collection } from "../../generated/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

// export types
export type CollectionCreationType = Pick<
	Collection,
	"userId" | "collectionName"
>;

export type CollectionUpdateType = Pick<
	Collection,
	"collectionId" | "collectionName"
>;

// --------- GET ------------------------------------------------------------------
/**
 * Retrieves a list of collection names and their corresponding identifiers owned by a specific user.
 *
 * @param userId - The unique identifier of the user.
 * @returns A promise resolving to an array of collections formatted for react-select.
 */
export const getUserCollectionNameIDs = cache(async function (
	userId: string,
): Promise<{ label: string; value: string }[]> {
	if (!userId) {
		console.error("Error Fetching Collection by user, user id is undefined");
		return [];
	}
	try {
		const collections = await prisma.collection.findMany({
			where: { userId },
			select: { collectionName: true, collectionId: true },
		});
		return collections.map((c) => ({
			label: c.collectionName,
			value: c.collectionId,
		}));
	} catch (error) {
		console.error(
			"Error fetching user collection names and IDs, fallback to empty array",
		);
		return [];
	}
});

/**
 * Retrieves a specific collection by its name for a given user.
 *
 * @param userId - The unique identifier of the user.
 * @param collectionName - The name of the collection to retrieve.
 * @returns A promise resolving to the Collection object if found, otherwise null.
 */
export const getUserCollectionByName = cache(async function (
	userId: string,
	collectionName: string,
): Promise<Collection | null> {
	if (!userId || !collectionName) {
		console.error(
			"Error Fetching Collection by Name, user id or collection name is undefined",
		);
		return null;
	}

	// composite identifier
	try {
		return await prisma.collection.findUnique({
			where: {
				userId_collectionName: { userId, collectionName },
			},
		});
	} catch (error) {
		console.error("Error fetching collection by name, fallback to null."); // Prevent crash during lookup.
		return null;
	}
});

// --------- CREATE ------------------------------------------------------------------
export async function createCollection(
	collectionToCreate: CollectionCreationType,
): Promise<Collection | null> {
	if (!collectionToCreate.collectionName || !collectionToCreate.userId) {
		console.error(
			"Error creating collection, user id or collection name is undefined, fallback to null.",
		);
		return null;
	}
	try {
		const creation = await prisma.collection.create({
			data: {
				userId: collectionToCreate.userId,
				collectionName: collectionToCreate.collectionName,
			},
		});
		revalidatePath("/collection");
		return creation;
	} catch (error) {
		console.error(
			"Error Creating Collection for User Profile, fallback to null",
		);
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				console.error(
					"--Collection Creation Unique Constraint (collection name & user id) Violation--",
				);
			}
		}
		return null;
	}
}
// --------- UPDATE ------------------------------------------------------------------
export async function updateCollection(
	collectionToUpdate: CollectionUpdateType,
): Promise<Collection | null> {
	if (!collectionToUpdate.collectionId || !collectionToUpdate.collectionName) {
		console.error(
			"Error updating collection, collection id or name is undefined, fallback to null.",
		);
		return null;
	}
	try {
		const update = await prisma.collection.update({
			where: {
				collectionId: collectionToUpdate.collectionId,
			},
			data: {
				collectionName: collectionToUpdate.collectionName,
			},
		});
		revalidatePath("/collection");
		return update;
	} catch (error) {
		console.error("Error updating collection, fallback to null.");
		return null;
	}
}
// --------- DELETE ------------------------------------------------------------------
export async function deleteCollectionById(
	collectionId: string,
	userId: string,
): Promise<Collection | null> {
	if (!collectionId || !userId) {
		console.error("Error deleting collection, collection ID or user ID undefined");
		return null;
	}
	try {
		const deletion = await prisma.collection.delete({
			where: { collectionId, userId },
		});
		revalidatePath("/collection");
		return deletion;
	} catch (error) {
		console.error("Error deleting collection, fallback to null.");
		return null;
	}
}
