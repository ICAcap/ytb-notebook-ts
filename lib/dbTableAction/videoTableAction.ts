"use server";

import { prisma } from "../prisma";
import { cache } from "react";
import { Video } from "../../generated/prisma";

// export types
export type VideoCardType = Pick<
	Video,
	"youtubeVidID" | "title" | "lastPlayedTime" | "videoId" | "createdAt"
>;

export type VideoDetailPageProp = Pick<
	Video,
	"videoId" | "youtubeVidID" | "title" | "lastPlayedTime"
> & { collections: string[] };

// --------- GET ------------------------------------------------------------------

/**
 * Fetches a single video with its details and collections for an authenticated user.
 * Cached for performance optimization.
 *
 * @param userId - The unique identifier of the user.
 * @param id - The video ID to retrieve.
 * @returns A promise resolving to video details or null if not found.
 */
export const getVideoById = cache(async function (
	userId: string,
	id: string,
): Promise<VideoDetailPageProp | null> {
	const video = await prisma.video.findFirst({
		where: { userId, videoId: id },
		include: { collections: true },
	});

	if (video) {
		return {
			videoId: video.videoId,
			title: video.title,
			youtubeVidID: video.youtubeVidID,
			lastPlayedTime: video.lastPlayedTime,
			collections: video.collections.map((c) => c.collectionName) || [],
		};
	}

	return null;
});

/**
 * Retrieves a paginated list of videos for a specific user.
 * Supports optional case-insensitive filtering of video titles via a search query.
 *
 * @param userId - The unique identifier of the user.
 * @param page - The page number to retrieve (1-indexed).
 * @param pageSize - The maximum number of videos to return per page.
 * @param q - The search string used to filter video titles.
 * @returns A promise resolving to an array of video data matching the VideoCardType.
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
 * Retrieves the total count of videos associated with a specific user.
 * The count can be filtered by a case-insensitive search query on the video title.
 *
 * @param userId - The unique identifier of the user.
 * @param q - The search string used to filter video titles.
 * @returns A promise resolving to the total number of matching video records.
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
 * Checks if a video from YouTube is already present in the user's library.
 * Uses a composite unique constraint of userId and youtubeVidID for the lookup.
 *
 * @param userId - The unique identifier of the user.
 * @param youtubeVideoId - The unique YouTube identifier for the video.
 * @returns A promise resolving to the video record if found, otherwise null.
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
 * Creates a new video record or updates an existing one for a user.
 * If the video exists, it links the video to the provided collection IDs.
 *
 * @param userId - The unique identifier of the user.
 * @param youtubeVideoId - The unique YouTube identifier for the video.
 * @param title - The title of the video.
 * @param collectionsID - A list of collection IDs to associate with the video.
 * @returns A promise resolving to the created or updated video record, or null on error.
 */
export const upsertYouTubeVideo = async function (
	userId: string,
	youtubeVideoId: string,
	title: string,
	collectionsID: string[],
): Promise<VideoCardType | null> {
	try {
		// Use upsert because of the @@unique([userId, youtubeVidID]) constraint
		const video = await prisma.video.upsert({
			where: {
				userId_youtubeVidID: {
					userId: userId,
					youtubeVidID: youtubeVideoId,
				},
			},
			update: {
				// in case need to modify the title
				title: title,
				// If the video already exists, we just add it to the new collections
				collections: {
					connect: collectionsID.map((id) => ({ collectionId: id })),
				},
			},
			create: {
				userId: userId,
				youtubeVidID: youtubeVideoId,
				title: title,
				// Connect the video to the provided collection IDs
				collections: {
					connect: collectionsID.map((id) => ({ collectionId: id })),
				},
			},
		});

		return video as VideoCardType;
	} catch (error) {
		console.error("Error Upserting Video to User Profile");
		return null;
	}
};

/**
 * Updates the playback progress (in seconds) for a specific video record.
 *
 * @param videoId - The unique identifier of the video record.
 * @param playedTime - The current playback position in seconds.
 * @returns A promise that resolves when the update operation is complete.
 */
export const updateVideoPlayedTime = async function (
	videoId: string,
	playedTime: number,
) {
	try {
		await prisma.video.update({
			where: { videoId: videoId },
			data: { lastPlayedTime: playedTime },
		});
	} catch (error) {
		console.error("Error updating video played time:", error);
	}
};

// --------- DELETE ------------------------------------------------------------------
