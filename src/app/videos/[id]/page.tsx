import Sidebar from "../../../_components/sidebar";
import { getVideoById } from "../../../../lib/dbTableAction/videoTableAction";
import { getNotesByVideo } from "../../../../lib/dbTableAction/noteTableAction";
import requireSession from "../../../../lib/requireSession";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import VideoDetailView from "./_components/VideoDetailView";
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
				<main className="flex-1 p-1">
					<Toaster />

					<VideoDetailView
						userId={userId}
						video={video}
						notes={vidNotes}
					/>
				</main>
			</div>
		</>
	);
}
