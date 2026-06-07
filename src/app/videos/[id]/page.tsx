import Sidebar from "../../../../components/sidebar";
import VideoPlayer from "./_components/VideoPlayer";
import { prisma } from "../../../../lib/prisma";
import { Video } from "../../../../generated/prisma";
import requireSession from "../../../../lib/requireSession";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cache } from "react";
import { ArrowLeft } from "lucide-react";

// a type that only takes data we need for video player from the Video model
type videoPlayerProp = Pick<
	Video,
	"videoId" | "youtubeVidID" | "title" | "lastPlayedTime"
> & { collections: string[] }; // intersection type with collections string array

// helper function to fetch video details by id for the authenticated user,
// cached for performance optimization
const getVideoById = cache(async function getVideoById(
	userId: string,
	id: string,
): Promise<videoPlayerProp | null> {
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
	const userId = session.user.id;

	const video = await getVideoById(userId, videoId);

	if (!video) {
		notFound();
	}

	return (
		<>
			<div className="flex min-h-screen">
				<Sidebar currentPath="/videos" />
				<main className="flex-1 p-6">
					<a
						href="/videos"
						className="btn btn-ghost gap-2"
					>
						<ArrowLeft className="rounded-full border-accent border-4 size-8" />
						Back to Videos
					</a>
					<div className="flex items-center gap-4 mb-6">
						<h1 className="text-4xl text-wrap">{`${video.title || "Unknown Video"}`}</h1>
					</div>
					<div className="mt-4 justify-evenly">
						<h2 className="text-xl text-base-content/60">Collections:</h2>
						<div className="flex flex-wrap gap-2 mt-2">
							{video.collections && video.collections.length > 0 ? (
								video.collections.map((collection, index) => (
									<span key={index} className="badge badge-accent">
										{collection}
									</span>
								))
							) : (
								<p className="text-base-content/50">No collections available.</p>
							)}
						</div>
					</div>
					<VideoPlayer
						videoId={video.videoId}
						userId={userId}
						url={`https://www.youtube.com/watch?v=${video.youtubeVidID}`}
						lastPlayedTime={video.lastPlayedTime}
					/>
				</main>
			</div>
		</>
	);
}
