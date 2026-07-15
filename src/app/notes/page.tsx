import requireSession from "../../../lib/requireSession";
import { getUserCollectionNameIDs } from "../../../lib/dbTableAction/collectionTableActions";
import {
	getNoteCountWithSearchParams,
	getNotesWithSearchParam,
	getNoteCountByUser,
} from "../../../lib/dbTableAction/noteTableAction";
import Pagination from "@/_components/pagination";
import Sidebar from "@/_components/sidebar";
import NoteSearchBar from "./_components/NoteSearchBar";
import { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { formatTimeStamp } from "../../../utils/formatTimeStamp";

export const metadata: Metadata = {
	title: "Find Notes",
	description: "This is the page where user finds notes by searching",
};

export default async function NoteSearchPage({
	searchParams,
}: {
	searchParams: Promise<{
		q?: string;
		page?: string;
		collection?: string;
		color?: string;
	}>;
}) {
	const session = await requireSession();
	const userId = session.user.id;

	const pageSize = 50;

	const params = await searchParams;
	const q = (params.q ?? "").trim();
	const page = Math.max(1, Number(params.page ?? 1));
	const collection = (params.collection ?? "").trim();
	const color = (params.color ?? "").trim();

	const [collections, searchedNotes, searchedNotesCnt] = await Promise.all([
		(await getUserCollectionNameIDs(userId)).filter((c) => c.videoNum > 0),
		getNotesWithSearchParam(userId, page, pageSize, q, collection, color),
		getNoteCountWithSearchParams(userId, q, collection, color),
	]);

	const totalPagesNum = Math.max(1, Math.ceil(searchedNotesCnt / pageSize));

	return (
		<div className="flex min-h-screen">
			<Toaster />
			<Sidebar currentPath="/notes" />
			<main className="flex-1 p-3">
				<header className="flex items-center justify-center mb-8">
					<h1 className="text-5xl font-semibold">Search My Notes</h1>
				</header>

				{/* searchbar with filtering */}
				<NoteSearchBar collections={collections} />

				{searchedNotes.length > 0 && (
					<div className="label mb-3">
						Page {page} of {totalPagesNum}, showing {1 + (page - 1) * pageSize}{" "}
						to{" "}
						{(page - 1) * pageSize + Math.min(searchedNotes.length, pageSize)}{" "}
						out of {searchedNotesCnt} results
					</div>
				)}
				<Suspense
					fallback={
						<span className="loading loading-spinner loading-xl"></span>
					}
				>
					<div className="flex flex-col gap-2 mb-4">
						{searchedNotes.map((note) => (
							<div
								key={note.noteId}
								className="flex flex-col gap-1 p-2 border-b border-base-300"
							>
								<span className="font-semibold">{note.video.title}</span>
								<span className="text-sm text-base-content/70">
									{formatTimeStamp(note.startTime)} -{" "}
									{formatTimeStamp(note.endTime)}
								</span>
								<span style={{ color: note.color }}>{note.contentText}</span>
							</div>
						))}
					</div>
				</Suspense>

				{/* Pagination bar */}
				{totalPagesNum > 1 && (
					<div className="mt-8 flex justify-center">
						<Pagination
							currentPage={page}
							totalPages={totalPagesNum}
							baseUrl="/notes"
							searchParams={{
								q,
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
