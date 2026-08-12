import Sidebar from "../../_components/sidebar";
import VideoSearchBar from "./_components/VideoSearchBar";
import Pagination from "../../_components/pagination";
import requireSession from "../../../lib/requireSession";
import VideoCard from "./_components/VideoCard";
import AddVideoButton from "./_components/AddVideoButton";
import { Metadata } from "next";
import {
	getAllUniqueVideoTitles,
	getVideoCardsWithSearchParam,
	getVideoNumWithSearchParam,
} from "../../../lib/dbTableAction/videoTableAction";
import { getNoteCountsByVideoIds } from "../../../lib/dbTableAction/noteTableAction";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";

const PAGE_SIZE = 20;

export const metadata: Metadata = {
	title: "My Videos",
	description: "This is the page showing all the videos",
};

// page component
export default async function VideoPage({
	searchParams,
}: {
	searchParams: Promise<{
		query?: string;
		page?: string;
		collection?: string;
	}>;
}) {
	const session = await requireSession();
	const userId = session.user.id;

	const params = await searchParams;
	const query = (params.query ?? "").trim();
	const page = Math.max(1, Number(params.page ?? 1)); // Prevent negative or zero page indices.
	const collection = (params.collection ?? "").trim();

	// fetch data from db video table
	const [unqVidTitles, totalCount, videoCards] = await Promise.all([
		getAllUniqueVideoTitles(userId),
		getVideoNumWithSearchParam(userId, query, collection),
		getVideoCardsWithSearchParam(userId, page, PAGE_SIZE, query, collection),
	]);

	const totalPagesNum = Math.max(1, Math.ceil(totalCount / PAGE_SIZE)); // Ensure at least one page exists for the UI.

	// get {video: # of notes contained} record for current page of vids
	const noteCounts = await getNoteCountsByVideoIds(
		userId,
		videoCards.map((v) => v.videoId),
	);

	return (
		<div className="flex min-h-screen">
			<Toaster />
			<Sidebar currentPath="/videos" />

			<main className="flex-1 p-3">
				<header className="flex items-center justify-between mb-8">
					<h1 className="text-5xl font-semibold">
						My Videos {collection ? ` - ${collection}` : ""}
					</h1>
					<AddVideoButton userId={userId} />
				</header>
				{/* Search bar */}
				<VideoSearchBar
					unqVidTitles={unqVidTitles}
					query={query}
					currentCollection={collection}
				/>

				{videoCards.length > 0 && (
					<div className="label mb-3">
						Page {page} of {totalPagesNum}, showing {1 + (page - 1) * PAGE_SIZE}{" "}
						to {(page - 1) * PAGE_SIZE + Math.min(videoCards.length, PAGE_SIZE)}{" "}
						out of {totalCount} results
					</div>
				)}

				{/* Video Card List */}
				<Suspense
					fallback={
						<span className="loading loading-spinner loading-xl"></span>
					}
				>
					{videoCards.length > 0 ? (
						<ul className="list bg-base-100 rounded-box shadow-md">
							{videoCards.map((video, idx) => (
								<div key={video.videoId}>
									<label className="label ml-1 font-semibold">
										{idx + 1 + (page - 1) * PAGE_SIZE}
									</label>
									<li className="list-row">
										<VideoCard
											{...video}
											userId={userId}
											noteCount={noteCounts[video.videoId] ?? 0}
										/>
									</li>
								</div>
							))}
						</ul>
					) : (
						<div>
							<h1 className="text-xl">No Matching Video(s) Found</h1>
						</div>
					)}
				</Suspense>

				{/* Pagination bar */}
				{totalPagesNum > 1 && (
					<div className="mt-8 flex justify-center">
						<Pagination
							currentPage={page}
							totalPages={totalPagesNum}
							baseUrl="/videos"
							searchParams={{
								query,
								collection: collection,
							}}
						/>
					</div>
				)}
			</main>
		</div>
	);
}
