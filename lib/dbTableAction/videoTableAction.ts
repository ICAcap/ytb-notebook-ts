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

/**
 * Fetches a paginated list of video cards for a specific user,
 * with optional case-insensitive search filtering by title.
 *
 * @param userId - The unique identifier of the user.
 * @param page - The page number to retrieve (starts at 1).
 * @param pageSize - The number of records to return per page.
 * @param q - The search query string to filter video titles.
 * @returns A promise that resolves to an array of VideoCardType objects.
 */
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

/**
 * Counts the total number of videos for a specific user,
 * optionally filtered by a search query.
 *
 * @param userId - The unique identifier of the user.
 * @param q - The search query string to filter video titles.
 * @returns A promise that resolves to the total count of matching videos.
 */
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

/**
 * Checks if a specific YouTube video has already been added to the user's collection.
 *
 * @param userId - The unique identifier of the user.
 * @param youtubeVideoId - The unique ID of the video from YouTube.
 * @returns A promise that resolves to a status indicating if the video exists.
 */
export const getExistingVideo = cache(async function (
	userId: string,
	youtubeVideoId: string,
): Promise<VideoCardType | null> {
	try {
		const v = await prisma.video.findUnique({
			where: {
				userId_youtubeVidID: { userId: userId, youtubeVidID: youtubeVideoId },
			},
			select: {
				videoId: true,
				youtubeVidID: true,
				title: true,
				lastPlayedTime: true,
				createdAt: true,
			},
		});

		return v as VideoCardType | null;
	} catch (error) {
		console.error("Error lookup user video table, fallback to null");
		return null;
	}
});

// --------- CREATE ------------------------------------------------------------------

// --------- UPDATE ------------------------------------------------------------------

/**
 * Updates the last recorded playback time for a specific video.
 *
 * @param userId - The unique identifier of the user.
 * @param videoId - The unique identifier of the video record.
 * @param playedTime - The timestamp in seconds of the last played position.
 * @returns A promise that resolves when the update operation completes.
 */
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
