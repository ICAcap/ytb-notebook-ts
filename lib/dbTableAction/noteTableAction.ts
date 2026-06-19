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
			console.error("Note Deletion failed, fallback to null return");
		}
	}

	console.error(
		"Note Deletion failed, userId or noteId is undefined, fallback to null return",
	);
	return null;
}
