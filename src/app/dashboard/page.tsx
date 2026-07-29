import Sidebar from "../../_components/sidebar";
import requireSession from "../../../lib/requireSession";
import { Metadata } from "next";
import Image from "next/image";
import { getVideoNumWithSearchParam } from "../../../lib/dbTableAction/videoTableAction";
import { getUserCollectionNameIDs } from "../../../lib/dbTableAction/collectionTableActions";
import { getNoteCountByUser } from "../../../lib/dbTableAction/noteTableAction";
import {
	Tv,
	FolderBookmark,
	Play,
	CircleUserRound,
	BookSearch,
} from "lucide-react";
import SignOutButton from "@/_components/SignOutButton";
import Link from "next/link";

export const metadata: Metadata = {
	title: "YTB Dashboard",
	description: "This is the dashboard page after signing in",
};
export default async function DashboardPage() {
	const session = await requireSession();
	const userId = session.user.id;

	const [totalVideos, collections, totalNotes] = await Promise.all([
		getVideoNumWithSearchParam(userId, "", ""),
		getUserCollectionNameIDs(userId),
		getNoteCountByUser(userId),
	]);

	return (
		<div className="flex min-h-screen">
			<Sidebar currentPath="/dashboard" />
			<main className="flex-1 p-6">
				<div className="max-w-4xl mx-auto space-y-8">
					{/* Welcome Card */}
					<div className="card bg-linear-to-br from-primary/10 to-accent/10 border border-primary/20 shadow-md">
						<div className="card-body flex-row items-center gap-6 justify-between">
							<div>
								<div className="relative w-16 h-16 overflow-hidden rounded-full border-2 border-primary/30 shrink-0">
									{session.user.image ? (
										<Image
											src={session.user.image}
											alt="avatar"
											fill
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
											className="object-cover" // Ensure image fills the circular container without distortion.
										/>
									) : (
										<div className="flex items-center justify-center w-full h-full">
											<CircleUserRound size={50} className="text-primary/60" />
										</div>
									)}
								</div>
								<div>
									<h1 className="card-title text-4xl">Welcome back!</h1>
									<p className="text-base-content/60 mt-1">
										{collections.length === 0 && totalVideos === 0
											? "Start by adding your first video & collection"
											: "Keep track of your favorite videos and organize them into collections"}
									</p>
								</div>
							</div>
							<SignOutButton />
						</div>
					</div>

					{/* Quick Links */}
					{totalVideos === 0 && collections.length === 0 ? (
						<div className="card bg-base-100 border border-base-200 shadow-sm">
							<div className="card-body text-center">
								<h2 className="card-title justify-center text-xl">
									Get Started
								</h2>
								<p className="text-base-content/60 mb-4">
									Add your first video to begin organizing your collection
								</p>
								<div className="card-actions justify-center">
									<Link href="/videos" className="btn btn-primary gap-2">
										<Play size={18} />
										Add Your First Video
									</Link>
								</div>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* video counts */}
							<Link
								href="/videos"
								className="card bg-info/15 border border-info/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
							>
								<div className="card-body items-center text-center py-10">
									<Tv className="w-16 h-16 text-info" />
									<p className="text-5xl font-bold">{totalVideos}</p>
									<p className="text-base-content/60 text-sm">Videos</p>
								</div>
							</Link>
							{/* collection counts */}
							<Link
								href="/collection"
								className="card bg-warning/15 border border-warning/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
							>
								<div className="card-body items-center text-center py-10">
									<FolderBookmark className="w-16 h-16 text-warning" />
									<p className="text-5xl font-bold">{collections.length}</p>
									<p className="text-base-content/60 text-sm">Collections</p>
								</div>
							</Link>
							{/* Note Count */}
							<Link
								href="/notes"
								className="card bg-success/15 border border-success/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
							>
								<div className="card-body items-center justify-center gap-2 py-10">
									<div className="flex items-center justify-center w-20 h-20 ">
										<BookSearch className="w-16 h-16 text-success" />
									</div>
									<div>
										<p className="text-5xl font-bold">{totalNotes}</p>
										<p className="text-base-content/60 text-center">Notes</p>
									</div>
								</div>
							</Link>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
