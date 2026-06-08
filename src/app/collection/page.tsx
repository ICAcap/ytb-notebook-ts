import requireSession from "../../../lib/requireSession";
import Sidebar from "../../../components/sidebar";
import { Metadata } from "next";
import { getUserCollectionNameIDs } from "../../../lib/dbTableAction/collectionTableActions";
import { Folder, FolderOpen, Plus } from "lucide-react";
import Link from "next/link";

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
						<Link href="/add-video" className="btn btn-primary btn-sm gap-2">
							<Plus size={18} />
							New Collection
						</Link>
					</header>

					{userCollections.length > 0 ? (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2">
							{userCollections.map((c) => (
								<div
									key={c.value}
									className="card card-compact hover:bg-base-200 cursor-pointer transition-colors select-none group"
								>
									<div className="card-body items-center text-center gap-3">
										<Folder className="w-28 h-28 text-warning" />
										<span className="card-title text-sm font-semibold line-clamp-2 justify-center">
											{/* Collection name */}
											{c.label}
										</span>
									</div>
								</div>
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
