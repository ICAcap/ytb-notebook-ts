import Sidebar from "../../_components/sidebar";
import requireSession from "../../../lib/requireSession";
import { Metadata } from "next";
import Image from "next/image";
import AddVideoButton from "../videos/_components/AddVideoButton";
import {
	getVideoNumWithSearchParam,
	getRecentlyWatchedVideos,
} from "../../../lib/dbTableAction/videoTableAction";
import { getUserCollectionNameIDs } from "../../../lib/dbTableAction/collectionTableActions";
import { getNoteCountByUser } from "../../../lib/dbTableAction/noteTableAction";
import {
	Tv,
	FolderBookmark,
	Play,
	CircleUserRound,
	BookSearch,
} from "lucide-react";
import RecentWatched from "./_components/RecentWatched";
import SignOutButton from "@/_components/SignOutButton";
import Link from "next/link";

export const metadata: Metadata = {
	title: "YTB Dashboard",
	description: "This is the dashboard page after signing in",
};
export default async function DashboardPage() {
	const session = await requireSession();
	const userId = session.user.id;

	const [totalVideos, collections, totalNotes, recentlyWatched] =
		await Promise.all([
			getVideoNumWithSearchParam(userId, "", ""),
			getUserCollectionNameIDs(userId),
			getNoteCountByUser(userId),
			getRecentlyWatchedVideos(userId),
		]);

	return (
		<div className="flex min-h-screen">
			<Sidebar currentPath="/dashboard" />
			<main className="flex-1 min-w-0 p-3 md:p-6">
				<div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
					{/* Welcome Card */}
					<div className="card bg-linear-to-br from-primary/10 to-accent/10 border border-primary/20 shadow-md">
						<div className="card-body flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 justify-between">
							<div className="flex items-center gap-4 min-w-0">
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
								<div className="min-w-0">
									<h1 className="card-title text-2xl sm:text-4xl">
										Welcome back!
									</h1>
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
							</div>
						</div>
					) : (
						<div className="grid grid-cols-3 gap-2 sm:gap-4">
							{/* video counts */}
							<Link
								href="/videos"
								className="card bg-info/15 border border-info/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
							>
								<div className="card-body items-center text-center gap-1 sm:gap-2 px-2 py-4 sm:py-10">
									<Tv className="w-10 h-10 sm:w-16 sm:h-16 text-info" />
									<p className="text-3xl sm:text-5xl font-bold">{totalVideos}</p>
									<p className="text-base-content/60 text-xs sm:text-sm">
										Videos
									</p>
								</div>
							</Link>
							{/* collection counts */}
							<Link
								href="/collection"
								className="card bg-warning/15 border border-warning/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
							>
								<div className="card-body items-center text-center gap-1 sm:gap-2 px-2 py-4 sm:py-10">
									<FolderBookmark className="w-10 h-10 sm:w-16 sm:h-16 text-warning" />
									<p className="text-3xl sm:text-5xl font-bold">
										{collections.length}
									</p>
									<p className="text-base-content/60 text-xs sm:text-sm">
										Collections
									</p>
								</div>
							</Link>
							{/* Note Count */}
							<Link
								href="/notes"
								className="card bg-success/15 border border-success/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
							>
								<div className="card-body items-center text-center gap-1 sm:gap-2 px-2 py-4 sm:py-10">
									<BookSearch className="w-10 h-10 sm:w-16 sm:h-16 text-success" />
									<p className="text-3xl sm:text-5xl font-bold">{totalNotes}</p>
									<p className="text-base-content/60 text-xs sm:text-sm">
										Notes
									</p>
								</div>
							</Link>
						</div>
					)}
					{/* Add new vid button */}
					<div className="flex justify-center">
						<AddVideoButton userId={userId} />
					</div>
					{/* Recently Watched */}
					<RecentWatched vids={recentlyWatched} />
				</div>
			</main>
		</div>
	);
}
