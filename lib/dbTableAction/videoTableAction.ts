"use server";

import { prisma } from "../prisma";

export async function updateVideoPlayedTime(
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
}
