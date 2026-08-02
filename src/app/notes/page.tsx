import requireSession from "../../../lib/requireSession";
import { getUserCollectionNameIDs } from "../../../lib/dbTableAction/collectionTableActions";
import {
	getNoteCountWithSearchParams,
	getNotesWithSearchParam,
	NoteWithVideo,
} from "../../../lib/dbTableAction/noteTableAction";
import Pagination from "@/_components/pagination";
import Sidebar from "@/_components/sidebar";
import NoteSearchBar from "./_components/NoteSearchBar";
import NoteListItem from "./_components/NoteListItem";
import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { StickyNoteOff } from "lucide-react";

export const metadata: Metadata = {
	title: "Find Notes",
	description: "This is the page where user finds notes by searching",
};

export default async function NoteSearchPage({
	searchParams,
}: {
	searchParams: Promise<{
		query?: string;
		page?: string;
		collection?: string;
		color?: string;
	}>;
}) {
	const session = await requireSession();
	const userId = session.user.id;

	const PAGE_SIZE = 50;

	const params = await searchParams;
	const query = (params.query ?? "").trim();
	const page = Math.max(1, Number(params.page ?? 1));
	const collection = (params.collection ?? "").trim();
	const color = (params.color ?? "").trim();

	const [collections, searchedNotes, searchedNotesCnt] = await Promise.all([
		(await getUserCollectionNameIDs(userId)).filter((c) => c.videoNum > 0),
		getNotesWithSearchParam(userId, page, PAGE_SIZE, query, collection, color),
		getNoteCountWithSearchParams(userId, query, collection, color),
	]);

	const searchedNotesGroupByVideoId = Object.groupBy(
		searchedNotes,
		({ videoId }) => videoId,
	) as Record<string, NoteWithVideo[]>;
	const totalPagesNum = Math.max(1, Math.ceil(searchedNotesCnt / PAGE_SIZE));

	return (
		<div className="flex min-h-screen">
			<Sidebar currentPath="/notes" />
			<main className="flex-1 p-3">
				<header className="flex items-center justify-center mb-8">
					<h1 className="text-5xl font-semibold">My Notes</h1>
				</header>

				{/* searchbar with filtering */}
				<NoteSearchBar collections={collections} />

				{searchedNotes.length > 0 && (
					<div className="label mb-3">
						Page {page} of {totalPagesNum}, showing {1 + (page - 1) * PAGE_SIZE}{" "}
						to{" "}
						{(page - 1) * PAGE_SIZE + Math.min(searchedNotes.length, PAGE_SIZE)}{" "}
						out of {searchedNotesCnt} results
					</div>
				)}
				<Suspense
					fallback={
						<span className="loading loading-spinner loading-xl"></span>
					}
				>
					{searchedNotesCnt === 0 ? (
						<div className="w-full p-4 flex items-center justify-center min-h-50">
							<span className="card card-xl text-center items-center text-2xl font-semibold">
								<p>No Notes Found</p>
								<br />
								<p>
									<StickyNoteOff size={80} />
								</p>
							</span>
						</div>
					) : (
						<div className="w-full mb-4">
							{Object.entries(searchedNotesGroupByVideoId).map(
								([videoId, notes]) => (
									<details
										key={videoId}
										className="collapse collapse-arrow rounded-2xl join-item border border-base-300 bg-base-100"
										open
									>
										{/* video title */}
										<summary className="collapse-title font-semibold text-xl min-w-0 flex flex-col items-start">
											<Link
												href={`/videos/${videoId}`}
												className="link link-hover text-blue-400 text-xl truncate inline-block max-w-full"
											>
												{notes[0].video.title}
											</Link>
										</summary>
										{/* note list for that video, accordion grouped */}
										<div className="collapse-content flex flex-col gap-2">
											{notes.map((note) => (
												<NoteListItem key={note.noteId} note={note} />
											))}
										</div>
									</details>
								),
							)}
						</div>
					)}
				</Suspense>

				{/* Pagination bar */}
				{totalPagesNum > 1 && (
					<div className="mt-8 flex justify-center">
						<Pagination
							currentPage={page}
							totalPages={totalPagesNum}
							baseUrl="/notes"
							searchParams={{
								query,
								collection: collection,
								color: color,
							}}
						/>
					</div>
				)}
			</main>
		</div>
	);
}
