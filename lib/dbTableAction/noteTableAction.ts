"use server";

import { prisma } from "../prisma";
import { InputJsonValue } from "../../generated/prisma/runtime/client";
import { Note, Prisma } from "../../generated/prisma";
import { JSONContent } from "@tiptap/react";
import { tiptapToText } from "../../utils/tiptapToText";

import { cache } from "react";

// Type
export type NoteCreation = {
	userId: string;
	videoId: string;
	startTime: number;
	endTime: number;
	content: InputJsonValue;
	color: string;
};

export type NoteUpdate = {
	userId: string;
	noteId: string;
	startTime: number;
	endTime: number;
	content: InputJsonValue;
	color: string;
};

export type NoteWithVideo = Note & {
	video: { title: string; videoId: string };
};

// GET /////////////////////////////
export const getNotesByVideo = cache(async function (
	userId: string,
	videoId: string,
): Promise<Note[] | null> {
	if (videoId && userId) {
		try {
			const noteList = await prisma.note.findMany({
				where: {
					videoId: videoId,
					userId: userId,
				},
				orderBy: [{ startTime: "asc" }, { createdAt: "asc" }],
			});
			return noteList;
		} catch (error) {
			console.error(
				"Get Notes By Video processed failed, fallback to null return",
				error,
			);
			return null;
		}
	}

	console.error(
		"Get Notes By Video failed, userId or videoId is undefined, fallback to null return",
	);
	return null;
});

export const getNoteById = cache(async function (
	userId: string,
	noteId: string,
): Promise<Note | null> {
	if (userId && noteId) {
		try {
			const note = await prisma.note.findUnique({
				where: {
					userId: userId,
					noteId: noteId,
				},
			});
			return note;
		} catch (error) {
			console.error(
				"Get Note By Id processed failed, fallback to null return",
				error,
			);
			return null;
		}
	}

	console.error(
		"Get Note By Id failed, userId or noteId is undefined, fallback to null return",
	);
	console.error(userId);
	console.error(noteId);
	return null;
});

export const getNotesByColor = cache(async function (
	userId: string,
	videoId: string,
	color: string,
): Promise<Note[] | null> {
	if (userId && videoId && color) {
		try {
			const notes = await prisma.note.findMany({
				where: {
					userId: userId,
					videoId: videoId,
					color: color,
				},
				orderBy: [{ startTime: "asc" }, { createdAt: "asc" }],
			});
			return notes;
		} catch (error) {
			console.error(
				"Get Notes By Color processed failed, fallback to null return",
				error,
			);
			return null;
		}
	}

	console.error(
		"Get Notes By Color failed, userId, videoId, or color is undefined, fallback to null return",
	);
	return null;
});

export const getNoteCountByVideo = cache(async function (
	userId: string,
	videoId: string,
): Promise<number> {
	if (userId && videoId) {
		try {
			const count = await prisma.note.count({
				where: {
					userId: userId,
					videoId: videoId,
				},
			});
			return count;
		} catch (error) {
			console.error(
				"Get Note Count By Video processed failed, fallback to 0 return",
				error,
			);
			return 0;
		}
	}

	console.error(
		"Get Note Count By Video failed, userId or videoId is undefined, fallback to 0 return",
	);
	return 0;
});

export const getNotesByUser = cache(async function (
	userId: string,
	page: number,
	pageSize: number,
): Promise<Note[]> {
	if (userId) {
		try {
			const skipItemNum = (page - 1) * pageSize;
			const notes = await prisma.note.findMany({
				where: {
					userId: userId,
				},
				skip: skipItemNum,
				take: pageSize,
				orderBy: {
					createdAt: "desc",
				},
			});
			return notes;
		} catch (error) {
			console.error(
				"Get Notes By User processed failed, fallback to empty array return",
				error,
			);
			return [];
		}
	}

	console.error(
		"Get Notes By User failed, userId is undefined, fallback to empty array return",
	);
	return [];
});

export const getNoteCountByUser = cache(async function (
	userId: string,
): Promise<number> {
	if (userId) {
		try {
			const count = await prisma.note.count({
				where: {
					userId: userId,
				},
			});
			return count;
		} catch (error) {
			console.error(
				"Get Note Count By User processed failed, fallback to 0 return",
				error,
			);
			return 0;
		}
	}

	console.error(
		"Get Note Count By User failed, userId is undefined, fallback to 0 return",
	);
	return 0;
});

// Minimum trigram similarity for a note's contentText to count as a fuzzy match.
const TRGM_SIMILARITY_THRESHOLD = 0.15;

// Shared WHERE fragment (without the leading "WHERE") for the search/count queries below.
// Combines: userId scoping, fuzzy+substring match on contentText, collection filter
// (via the implicit "_CollectionToVideo" join table), and color filter.
function buildSearchWhereFragment(
	userId: string,
	query: string,
	collectionIds: string[],
	colors: string[],
): Prisma.Sql {
	const conditions: Prisma.Sql[] = [Prisma.sql`n."userId" = ${userId}`];

	if (query) {
		conditions.push(
			Prisma.sql`(n."contentText" ILIKE ${"%" + query + "%"} OR similarity(n."contentText", ${query}) > ${TRGM_SIMILARITY_THRESHOLD})`,
		);
	}

	if (collectionIds.length) {
		conditions.push(
			Prisma.sql`EXISTS (
				SELECT 1 FROM "_CollectionToVideo" ctv
				WHERE ctv."B" = n."videoId" AND ctv."A" IN (${Prisma.join(collectionIds)})
			)`,
		);
	}

	if (colors.length) {
		conditions.push(Prisma.sql`n."color" IN (${Prisma.join(colors)})`);
	}

	return Prisma.join(conditions, " AND ");
}

export const getNotesWithSearchParam = cache(async function (
	userId: string,
	page: number,
	pageSize: number,
	query: string,
	collection: string,
	color: string,
): Promise<NoteWithVideo[]> {
	if (!userId) {
		console.error("Error fetching notes, user ID is undefined");
		return [];
	}

	// Calculate how many items to skip
	const skipItemNum = (page - 1) * pageSize;

	// build where clause
	// 1. Query query: fuzzy trigram similarity + substring match on contentText
	// 2. collection (via parent video, Note has no direct collection relation); comma-separated collectionIds, OR'd
	// 3. color hex; comma-separated, OR'd
	const collectionIds = collection ? collection.split(",").filter(Boolean) : [];
	const colors = color ? color.split(",").filter(Boolean) : [];

	const whereFragment = buildSearchWhereFragment(userId, query, collectionIds, colors);

	// When there's a query, rank best fuzzy matches first; otherwise fall back to
	// the original video-title/startTime/createdAt ordering.
	const orderByFragment = query
		? Prisma.sql`ORDER BY similarity(n."contentText", ${query}) DESC, n."startTime" ASC, n."createdAt" ASC`
		: Prisma.sql`ORDER BY v."title" ASC, n."startTime" ASC, n."createdAt" ASC`;

	try {
		const notes = await prisma.$queryRaw<NoteWithVideo[]>`
			SELECT n.*, jsonb_build_object('title', v."title", 'videoId', v."videoId") AS video
			FROM "Note" n
			JOIN "Video" v ON v."videoId" = n."videoId"
			WHERE ${whereFragment}
			${orderByFragment}
			LIMIT ${pageSize}
			OFFSET ${skipItemNum}
		`;

		return notes;
	} catch (error) {
		console.error("Error fetching notes data with searchParam", error);
		return [];
	}
});

export const getNoteCountWithSearchParams = cache(async function (
	userId: string,
	query: string,
	collection: string,
	color: string,
): Promise<number> {
	if (!userId) {
		console.error("Error fetching note search count, user ID is undefined");
		return 0;
	}
	const collectionIds = collection ? collection.split(",").filter(Boolean) : [];
	const colors = color ? color.split(",").filter(Boolean) : [];

	const whereFragment = buildSearchWhereFragment(userId, query, collectionIds, colors);

	try {
		const result = await prisma.$queryRaw<{ count: bigint }[]>`
			SELECT COUNT(*) AS count
			FROM "Note" n
			JOIN "Video" v ON v."videoId" = n."videoId"
			WHERE ${whereFragment}
		`;
		return Number(result[0]?.count ?? 0);
	} catch (error) {
		console.error("Error fetching note search count", error);
		return 0;
	}
});

// CREATE /////////////////////////////
export async function createNote({
	userId,
	videoId,
	startTime,
	endTime,
	content,
	color,
}: NoteCreation): Promise<Note | null> {
	if (userId && videoId) {
		if (endTime < startTime) {
			console.error(
				"End Time cant be less than Start Time, fallback to null return",
			);
			return null;
		}

		try {
			const creation = await prisma.note.create({
				data: {
					userId: userId,
					videoId: videoId,
					startTime: startTime,
					endTime: endTime,
					content: content,
					color: color,
					contentText: tiptapToText(content as JSONContent),
				},
			});
			return creation;
		} catch (error) {
			console.error(
				"Create Note processed failed, fallback to null return",
				error,
			);
			return null;
		}
	}
	console.error(
		"Create Note failed, userId or videoId is undefined, fallback to null return",
	);
	return null;
}
// POST /////////////////////////////
export async function updateNote({
	userId,
	noteId,
	startTime,
	endTime,
	content,
	color,
}: NoteUpdate): Promise<Note | null> {
	if (userId && noteId) {
		if (startTime > endTime) {
			console.error(
				"End Time cant be less than Start Time, fallback to null return",
			);
			return null;
		}

		try {
			const updated = await prisma.note.update({
				where: {
					userId: userId,
					noteId: noteId,
				},
				data: {
					startTime: startTime,
					endTime: endTime,
					content: content,
					color: color,
					contentText: tiptapToText(content as JSONContent),
				},
			});
			return updated;
		} catch (error) {
			console.error(
				"Update Note processed failed, fallback to null return",
				error,
			);
			return null;
		}
	}

	console.error(
		"Update Note failed, userId or noteId is undefined, fallback to null return",
	);
	return null;
}
// DELETE /////////////////////////////
export async function deleteNote(
	userId: string,
	noteId: string,
): Promise<Note | null> {
	if (userId && noteId) {
		try {
			const deletion = await prisma.note.delete({
				where: { userId: userId, noteId: noteId },
			});
			return deletion;
		} catch (error) {
			console.error("Note Deletion failed, fallback to null return", error);
			return null;
		}
	}

	console.error(
		"Note Deletion failed, userId or noteId is undefined, fallback to null return",
	);
	return null;
}
