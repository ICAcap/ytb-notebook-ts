"use server";

import { prisma } from "../prisma";
import { cache } from "react";
import { Collection } from "../../generated/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { connect } from "http2";

// export types
export type CollectionCreationType = Pick<
	Collection,
	"userId" | "collectionName"
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
export const createCollection = cache(async function (
	collectionToCreate: CollectionCreationType,
): Promise<Collection | null> {
	try {
		const creation = await prisma.collection.create({
			data: {
				userId: collectionToCreate.userId,
				collectionName: collectionToCreate.collectionName,
			},
		});
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
});
// --------- UPDATE ------------------------------------------------------------------

// --------- DELETE ------------------------------------------------------------------
