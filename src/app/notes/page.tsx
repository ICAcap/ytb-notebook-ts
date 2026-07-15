import requireSession from "../../../lib/requireSession";
import { getUserCollectionNameIDs } from "../../../lib/dbTableAction/collectionTableActions";
import {
	getNoteSearchCount,
	getNotesWithSearchParam,
	getNoteCountByUser,
} from "../../../lib/dbTableAction/noteTableAction";
import Pagination from "@/_components/pagination";
import Sidebar from "@/_components/sidebar";
import NoteSearchBar from "./_components/NoteSearchBar";
import { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";

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
	const page = Math.max(1, Number(params.page ?? 1)); // Prevent negative or zero page indices.
	const collection = (params.collection ?? "").trim();
	const color = (params.color ?? "").trim();

	const collections = await getUserCollectionNameIDs(userId);

	return (
		<div className="flex min-h-screen">
			<Toaster />
			<Sidebar currentPath="/notes" />
			<main className="flex-1 p-3">
				<header className="flex items-center justify-center mb-8">
					<h1 className="text-5xl font-semibold">Search My Notes</h1>
				</header>

				{/* searchbar with filtering - TBD */}
				<NoteSearchBar collections={collections} />
			</main>
		</div>
	);
}
