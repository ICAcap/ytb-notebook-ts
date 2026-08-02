"use server";

import { prisma } from "../prisma";
import { InputJsonValue } from "../../generated/prisma/runtime/client";
import { Note } from "../../generated/prisma";
import { JSONContent } from "@tiptap/react";
import { tiptapToText } from "../../utils/tiptapToText";
import { noteWriteRateLimit } from "../../utils/ratelimiter";
import { DEMO_ALLOWED_ADD_NEW_NOTE } from "@/app/demo/_data/demoData";
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

// Batched note count for a page of videos: one groupBy query instead of one count() per video.
export const getNoteCountsByVideoIds = cache(async function (
	userId: string,
	videoIds: string[],
): Promise<Record<string, number>> {
	if (!userId || videoIds.length === 0) return {};

	try {
		const counts = await prisma.note.groupBy({
			by: ["videoId"],
			where: {
				userId: userId,
				videoId: { in: videoIds },
			},
			_count: { videoId: true },
		});

		return Object.fromEntries(
			counts.map((c) => [c.videoId, c._count.videoId]),
		);
	} catch (error) {
		console.error(
			"Get Note Counts By Video Ids processed failed, fallback to empty object",
			error,
		);
		return {};
	}
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

// Shared WHERE clause (without the leading "WHERE") for the search/count queries below.
// Combines: userId scoping, fuzzy+substring match on contentText, collection filter
// (via the implicit "_CollectionToVideo" join table), and color filter.
//
// Built as plain SQL text + a positional params array (for $queryRawUnsafe) instead of
// composed Prisma.sql/Prisma.join fragments: Prisma 7.8.0 has a regression where a
// Prisma.Sql fragment interpolated into another $queryRaw/Prisma.sql template gets
// serialized as JSON instead of composed, corrupting parameter numbering
// (https://github.com/prisma/prisma/issues/28963). All user-controlled values below are
// still passed through `params` and referenced positionally as $N, never string-interpolated.
function buildSearchWhereClause(
	userId: string,
	query: string,
	collectionIds: string[],
	colors: string[],
): { text: string; params: unknown[] } {
	const params: unknown[] = [userId];
	const conditions: string[] = [`n."userId" = $1`];

	if (query) {
		params.push("%" + query + "%", query, TRGM_SIMILARITY_THRESHOLD);
		const likeParam = params.length - 2;
		const simParam = params.length - 1;
		const thresholdParam = params.length;
		conditions.push(
			`(n."contentText" ILIKE $${likeParam} OR similarity(n."contentText", $${simParam}) > $${thresholdParam})`,
		);
	}

	if (collectionIds.length) {
		const placeholders = collectionIds.map((id) => {
			params.push(id);
			return `$${params.length}`;
		});
		conditions.push(
			`EXISTS (
				SELECT 1 FROM "_CollectionToVideo" ctv
				WHERE ctv."B" = n."videoId" AND ctv."A" IN (${placeholders.join(", ")})
			)`,
		);
	}

	if (colors.length) {
		const placeholders = colors.map((c) => {
			params.push(c);
			return `$${params.length}`;
		});
		conditions.push(`n."color" IN (${placeholders.join(", ")})`);
	}

	return { text: conditions.join(" AND "), params };
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

	const { text: whereText, params } = buildSearchWhereClause(
		userId,
		query,
		collectionIds,
		colors,
	);

	// When there's a query, rank best fuzzy matches first; otherwise fall back to
	// the original video-title/startTime/createdAt ordering.
	let orderByText: string;
	if (query) {
		params.push(query);
		orderByText = `ORDER BY similarity(n."contentText", $${params.length}) DESC, n."startTime" ASC, n."createdAt" ASC`;
	} else {
		orderByText = `ORDER BY v."title" ASC, n."startTime" ASC, n."createdAt" ASC`;
	}

	params.push(pageSize);
	const limitParam = params.length;
	params.push(skipItemNum);
	const offsetParam = params.length;

	const sqlText = `
		SELECT n.*, jsonb_build_object('title', v."title", 'videoId', v."videoId") AS video
		FROM "Note" n
		JOIN "Video" v ON v."videoId" = n."videoId"
		WHERE ${whereText}
		${orderByText}
		LIMIT $${limitParam}
		OFFSET $${offsetParam}
	`;

	try {
		const notes = await prisma.$queryRawUnsafe<NoteWithVideo[]>(
			sqlText,
			...params,
		);

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

	const { text: whereText, params } = buildSearchWhereClause(
		userId,
		query,
		collectionIds,
		colors,
	);

	const sqlText = `
		SELECT COUNT(*) AS count
		FROM "Note" n
		JOIN "Video" v ON v."videoId" = n."videoId"
		WHERE ${whereText}
	`;

	try {
		const result = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
			sqlText,
			...params,
		);
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

		// Rate limit check for note creation
		const { success } = await noteWriteRateLimit.limit(userId);
		if (!success) {
			console.error("Note rate limit exceeded for user", userId);
			return null;
		}

		try {
			// lookup user to check demo status flag
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { isAnonymous: true },
			});
			if (user?.isAnonymous) {
				const demoNotesNum = await prisma.note.count({
					where: { userId: userId },
				});
				if (demoNotesNum >= 1 + DEMO_ALLOWED_ADD_NEW_NOTE) return null;
			}

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

		// Rate limit check for note update
		const { success } = await noteWriteRateLimit.limit(userId);
		if (!success) {
			console.error("Note rate limit exceeded for user", userId);
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
