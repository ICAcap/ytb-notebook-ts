import Sidebar from "../../../_components/sidebar";
import CollectionBadgeList from "../_components/CollectionBadgeList";
import { getVideoById } from "../../../../lib/dbTableAction/videoTableAction";
import { getNotesByVideo } from "../../../../lib/dbTableAction/noteTableAction";
import requireSession from "../../../../lib/requireSession";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import VideoPlayerAndNotesContainer from "./_components/VideoPlayerAndNotesContainer";
import { Toaster } from "react-hot-toast";

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

	// DB data access
	const video = await getVideoById(userId, videoId);
	const vidNotes = await getNotesByVideo(userId, videoId);

	if (!video) {
		notFound();
	}

	return (
		<>
			<div className="flex min-h-screen">
				<Sidebar currentPath="/videos" />
				<main className="flex-1 p-3">
					<Toaster />
					<div className="flex mb-0.5">
						<h1 className="text-2xl text-wrap font-semibold">
							{`${video.title || "Unknown Video"}`}
						</h1>
					</div>
					<div className="mt-4">
						<h2 className="text-md text-base-content/60">Collections:</h2>
						<div className="flex flex-wrap gap-2 mt-1">
							{video.collections && video.collections.length > 0 ? (
								<CollectionBadgeList collections={video.collections} />
							) : (
								<p className="text-base-content/50">
									Not Part of Any Collections.
								</p>
							)}
						</div>
					</div>
					<VideoPlayerAndNotesContainer
						userId={userId}
						video={video}
						notes={vidNotes}
					/>
				</main>
			</div>
		</>
	);
}
