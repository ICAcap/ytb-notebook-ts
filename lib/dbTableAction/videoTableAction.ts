"use server";

import { prisma } from "../prisma";
import { VideoCardType } from "@/app/videos/page";
import { cache } from "react";

// --------- GET ------------------------------------------------------------------
export const getVideoCardsWithPagination = cache(async function (
	userId: string,
	page: number = 1,
	pageSize: number = 20,
): Promise<VideoCardType[]> {
	// Calculate how many items to skip
	// Page 1: (1-1) * pageSize = 0
	// Page 2: (2-1) * pageSize = pageSize
	const skip = (page - 1) * pageSize;
	try {
		const videos = await prisma.video.findMany({
			where: {
				userId: userId,
			},
			take: pageSize,
			skip: skip,
		});
		return videos as VideoCardType[];
	} catch (error) {
		console.error("Error fetching videos with pagination:", error);
		return [] as VideoCardType[];
	}
});
// --------- CREATE ------------------------------------------------------------------

// --------- UPDATE ------------------------------------------------------------------
export const updateVideoPlayedTime = cache(async function (
	userId: string,
	videoId: string,
	playedTime: number,
) {
	try {
		await prisma.video.updateMany({
			where: { userId, videoId },
			data: { lastPlayedTime: playedTime },
		});

		// console.log(
		// 	`Updated played time for video ${videoId} and user ${userId} to ${playedTime} seconds`,
		// );
	} catch (error) {
		console.error("Error updating video played time:", error);
	}
});

// --------- DELETE ------------------------------------------------------------------
