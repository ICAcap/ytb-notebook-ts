import Sidebar from "../../../../components/sidebar";
import VideoPlayer from "./_components/VideoPlayer";
import { getVideoById } from "../../../../lib/dbTableAction/videoTableAction";
import requireSession from "../../../../lib/requireSession";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";

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
					<div className="flex justify-center mb-1">
						<h1 className="text-3xl text-wrap font-semibold text-center">
							{`${video.title || "Unknown Video"}`}
						</h1>
					</div>
					<div className="mt-4">
						<h2 className="text-xl text-base-content/60">Collections:</h2>
						<div className="flex flex-wrap gap-2 mt-2">
							{video.collections && video.collections.length > 0 ? (
								video.collections.map((collection, index) => (
									// click collection tag to be redirected to other videos in that collection
									<span
										key={index}
										className="btn btn-xs btn-accent rounded-full"
									>
										<Link
											href={
												"/videos?" +
												new URLSearchParams({
													collection: collection.label,
												}).toString()
											}
										>
											{collection.label}
										</Link>
									</span>
								))
							) : (
								<p className="text-base-content/50">
									Not Part of Any Collections.
								</p>
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
