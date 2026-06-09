import requireSession from "../../../lib/requireSession";
import Sidebar from "../../../components/sidebar";
import { Metadata } from "next";
import { getUserCollectionNameIDs } from "../../../lib/dbTableAction/collectionTableActions";
import { FolderOpen, Plus } from "lucide-react";
import CollectionCard from "./_components/CollectionCard";
import AddCollectionButton from "./_components/AddCollectionButton";

export const metadata: Metadata = {
	title: "Collections",
	description: "This is the page showing all your video collections",
};

export default async function CollectionPage() {
	const session = await requireSession();
	const userId = session.user.id;

	const userCollections = await getUserCollectionNameIDs(userId);

	return (
		<div className="flex min-h-screen">
			<Sidebar currentPath="/collection" />
			<main className="flex-1 p-6">
				<div className="max-w-6xl mx-auto">
					<header className="flex items-center justify-between mb-8">
						<h1 className="text-3xl font-bold">My Collections</h1>
						<AddCollectionButton />
					</header>
					{userCollections.length > 0 ? (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2">
							{userCollections.map((c) => (
								<CollectionCard key={c.value} id={c.value} name={c.label} />
							))}
						</div>
					) : (
						<div className="hero py-16">
							<div className="hero-content flex-col text-center">
								<FolderOpen className="w-20 h-20 text-base-content/30" />
								<h2 className="text-lg font-semibold text-base-content/60">
									No collections yet
								</h2>
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
