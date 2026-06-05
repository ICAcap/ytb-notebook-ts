import Sidebar from "../../../components/sidebar";
import Pagination from "../../../components/pagination";
import requireSession from "../../../lib/requireSession";
import VideoCard from "./_components/VideoCard";
import { Metadata } from "next";
import { Video } from "../../../generated/prisma";
import {
	getVideoCardsWithSearchParam,
	getVideoNumWithSearchParam,
} from "../../../lib/dbTableAction/videoTableAction";
import { Suspense } from "react";
import { X } from "lucide-react";

export const metadata: Metadata = {
	title: "Videos",
	description: "This is the page showing all the videos",
};

// a type that only takes data we need for video card from the Video model
export type VideoCardType = Pick<
	Video,
	"url" | "title" | "lastPlayedTime" | "videoId" | "createdAt"
>;

// page component
export default async function VideoPage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string; page?: string }>;
}) {
	const session = await requireSession();
	const usrId = session.user.id;

	const params = await searchParams;
	const q = (params.q ?? "").trim();
	const page = Math.max(1, Number(params.page ?? 1)); // Prevent negative or zero page indices.
	const pageSize = 15;

	// fetch data from db video table
	const [totalCount, videoCards] = await Promise.all([
		getVideoNumWithSearchParam(usrId, q),
		getVideoCardsWithSearchParam(usrId, page, pageSize, q),
	]);

	const totalPagesNum = Math.max(1, Math.ceil(totalCount / pageSize)); // Ensure at least one page exists for the UI.

	return (
		<div className="flex min-h-screen">
			<Sidebar currentPath="/videos" />

			<main className="flex-1 p-6">
				<h1 className="text-2xl font-bold text-center mb-8">Your Videos</h1>

				{/* Search bar */}
				<div className="mb-8">
					<form className="join w-full" action="/videos" method="GET">
						<input
							name="q"
							defaultValue={q}
							placeholder="Search Video Title..."
							className="join-item input input-bordered flex-1 focus:outline-none"
						/>
						<button className="join-item btn btn-primary">Search</button>
						{q && (
							<a
								href="/videos"
								className="join-item btn btn-ghost"
								title="Clear search"
							>
								<X size={25} />
							</a>
						)}
					</form>
				</div>

				{/* Videocard List */}
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

				{/* Pagination bar */}
				{totalPagesNum > 1 && (
					<div className="mt-8 flex justify-center">
						<Pagination
							currentPage={page}
							totalPages={totalPagesNum}
							baseUrl="/videos"
							searchParams={{
								q,
								pageSize: String(pageSize), // Convert to string to match expected API for URL params.
							}}
						/>
					</div>
				)}
			</main>
		</div>
	);
}
