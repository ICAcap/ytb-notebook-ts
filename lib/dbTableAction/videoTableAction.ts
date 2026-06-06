"use server";

import { prisma } from "../prisma";
import { cache } from "react";
import { Video } from "../../generated/prisma";

// export types
export type VideoCardType = Pick<
	Video,
	"youtubeVidID" | "title" | "lastPlayedTime" | "videoId" | "createdAt"
>;

// --------- GET ------------------------------------------------------------------
export const getVideoCardsWithSearchParam = cache(async function (
	userId: string,
	page: number,
	pageSize: number,
	q: string,
): Promise<VideoCardType[]> {
	// Calculate how many items to skip
	// Page 1: (1-1) * pageSize = 0
	// Page 2: (2-1) * pageSize = pageSize
	const skipItemNum = (page - 1) * pageSize;

	// Build the where clause for the query, including the search filter if provided.
	const where = {
		userId,
		...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
	};

	try {
		const videos = await prisma.video.findMany({
			where: where,
			take: pageSize,
			skip: skipItemNum,
		});
		return videos as VideoCardType[];
	} catch (error) {
		console.error("Error fetching video card data with searchParam:", error);
		return [] as VideoCardType[];
	}
});

export const getVideoNumWithSearchParam = cache(async function (
	userId: string,
	q: string,
): Promise<number> {
	const where = {
		userId,
		...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
	};

	try {
		const totalVideoAmount = await prisma.video.count({ where });
		return totalVideoAmount;
	} catch (error) {
		console.error(
			"Error fetching total video num with searchParam, fallback to 0",
		);
		return 0;
	}
});

export const checkVideoAlreadyExist = cache(async function (
	userId: string,
	youtubeVideoId: string,
): Promise<any> {
	return 0;
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
