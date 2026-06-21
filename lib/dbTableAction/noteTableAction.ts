"use server";

import { prisma } from "../prisma";
import { InputJsonValue } from "../../generated/prisma/runtime/client";
import { Note } from "../../generated/prisma";

import { cache } from "react";
import { revalidatePath } from "next/cache";

// Type
export type NoteCreation = {
	userId: string;
	videoId: string;
	startTime: number;
	endTime: number;
	content: InputJsonValue;
	color: string;
	screenshotUrl?: string;
};

export type NoteUpdate = {
	userId: string;
	noteId: string;
	startTime: number;
	endTime: number;
	content: InputJsonValue;
	color: string;
	screenshotUrl?: string;
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

/**
 * Logic:
 * start time >= current time + time window
 */
export const getUpcomingNotesInVideo = cache(async function (
	userId: string,
	videoId: string,
	currentTime: number,
	timeWindow: number = 900,
): Promise<Note[] | null> {
	if (userId && videoId) {
		try {
			const activeNotes = await prisma.note.findMany({
				where: {
					userId: userId,
					videoId: videoId,
					startTime: { gte: currentTime + timeWindow },
				},
				orderBy: [{ startTime: "asc" }, { createdAt: "asc" }],
			});
			return activeNotes;
		} catch (error) {
			console.error(
				"Get Active Notes processed failed, fallback to null return",
				error,
			);
			return null;
		}
	}

	console.error(
		"Get Active Notes failed, userId or videoId is undefined, fallback to null return",
	);
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

// CREATE /////////////////////////////
export async function createNote({
	userId,
	videoId,
	startTime,
	endTime,
	content,
	color,
	screenshotUrl,
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
					screenshotUrl: screenshotUrl,
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
	screenshotUrl,
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
					screenshotUrl: screenshotUrl,
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
