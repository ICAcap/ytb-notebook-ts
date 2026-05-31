import Sidebar from "../../../../components/sidebar";
import VideoPlayer from "./_components/VideoPlayer";
import { prisma } from "../../../../lib/prisma";
import requireSession from "../../../../lib/requireSession";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cache } from "react";

type video = {
	vidId: string;
	title: string;
	url: string;
	lastPlayedTime: number;
	collections: string[];
};

// helper function to fetch video details by id for the authenticated user,
// cached for performance optimization
const getVideoById = cache(async function getVideoById(
	userId: string,
	id: string,
): Promise<video | null> {
	const video = await prisma.video.findFirst({
		where: { userId, videoId: id },
		include: { collections: true },
	});

	if (video) {
		return {
			vidId: video.videoId,
			title: video.title,
			url: video.url,
			lastPlayedTime: video.lastPlayedTime,
			collections: video.collections.map((c) => c.collectionName) || [],
		};
	}

	return null;
});

// helper function to fetch video details by id for the authenticated user
// https://www.slingacademy.com/article/next-js-how-to-set-page-title-and-meta-description/#static-title-and-meta-description
export async function generateMetadata({
	params,
}: {
	params: { id: string };
}): Promise<Metadata> {
	const session = await requireSession();
	const videoId = (await params).id;
	const video = await getVideoById(session.user.id, videoId);

	if (!video) {
		return { title: "Video Not Found", description: "Video Not Found" };
	}

	return {
		title: video.title,
		description: video.title,
	};
}

///////////////////////////////////////////////////////////////////////
// async component
export default async function VidViewPage({
	params,
}: {
	params: { id: string };
}) {
	const session = await requireSession(); // unauthenticated users will be redirected to sign-in page, so session is guaranteed to be available here
	const videoId = (await params).id;
	const usrId = session.user.id;

	const video = await getVideoById(usrId, videoId);

	if (!video) {
		notFound();
	}

	return (
		<>
			<div className="flex min-h-screen">
				<Sidebar currentPath="/videos" />
				<main className="flex-1 p-6">
					<h1 className="text-4xl text-wrap">{`${video.title || "Unknown Video"}`}</h1>
					<div className="mt-4 justify-evenly">
						<h2 className="text-xl text-gray-400">Collections:</h2>
						<div className="flex flex-wrap gap-2 mt-2">
							{video.collections && video.collections.length > 0 ? (
								video.collections.map((collection, index) => (
									<span
										key={index}
										className="bg-red-400 px-3 py-1 rounded-full text-sm"
									>
										{collection}
									</span>
								))
							) : (
								<p className="text-gray-500">No collections available.</p>
							)}
						</div>
					</div>
					<VideoPlayer
						videoId={video.vidId}
						userId={usrId}
						url={video.url}
						lastPlayedTime={video.lastPlayedTime}
					/>
				</main>
			</div>
		</>
	);
}
