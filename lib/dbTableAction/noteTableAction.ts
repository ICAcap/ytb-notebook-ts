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

// GET

// CREATE
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
				"End Time can be less than Start Time, fallback to null return",
			);
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

// POST

// DELETE
