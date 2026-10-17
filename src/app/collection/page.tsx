import requireSession from "../../../lib/requireSession";
import Sidebar from "../../_components/sidebar";
import { Metadata } from "next";
import { getUserCollectionInfos } from "../../../lib/dbTableAction/collectionTableActions";
import AddCollectionButton from "./_components/AddCollectionButton";
import CollectionContextProvider from "./_components/CollectionContextProvider";
import CollectionGrid from "./_components/CollectionGrid";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
	title: "Collections",
	description: "This is the page showing all your video collections",
};

export default async function CollectionPage() {
	const session = await requireSession();
	const userId = session.user.id;

	const userCollectionInfos = await getUserCollectionInfos(userId);

	return (
		<CollectionContextProvider userId={userId}>
			<Toaster />
			<div className="flex min-h-screen">
				<Sidebar currentPath="/collection" />
				<main className="flex-1 min-w-0 p-3 md:p-6">
					<div className="max-w-[1600px] mx-auto">
						<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
							<h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold">
								My Collections
							</h1>
							<AddCollectionButton />
						</header>
						<CollectionGrid userCollectionInfos={userCollectionInfos} />
					</div>
				</main>
			</div>
		</CollectionContextProvider>
	);
}
