import Sidebar from "../../../components/sidebar";
import requireSession from "../../../lib/requireSession";
import VideoCard from "./_components/VideoCard";
import { Metadata } from "next";
import { Video } from "../../../generated/prisma";
import { getVideoCardsWithPagination } from "../../../lib/dbTableAction/videoTableAction";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Videos",
	description: "This is the page showing all the videos",
};

// a type that only takes data we need for video card from the Video model
export type VideoCardType = Pick<
	Video,
	"url" | "title" | "lastPlayedTime" | "videoId" | "createdAt"
>;

export default async function VideoPage() {
	const session = await requireSession();
	const usrId = session.user.id;

	const videoCards = await getVideoCardsWithPagination(usrId, 1);

	return (
		<div className="flex min-h-screen">
			<Sidebar currentPath="/videos" />

			<main className="flex-1 p-6">
				<h1 className="text-3xl text-center mb-6">Your Videos</h1>
				<Suspense
					fallback={
						<span className="loading loading-spinner loading-xl"></span>
					}
				>
					<ul className="list bg-base-100 rounded-box shadow-md">
						{videoCards.map((video) => (
							<li key={video.videoId} className="list-row">
								<VideoCard {...video} />
							</li>
						))}
					</ul>
				</Suspense>
			</main>
		</div>
	);
}
