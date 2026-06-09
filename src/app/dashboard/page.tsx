import Sidebar from "../../../components/sidebar";
import requireSession from "../../../lib/requireSession";
import { Metadata } from "next";
import Image from "next/image";
import { getVideoNumWithSearchParam } from "../../../lib/dbTableAction/videoTableAction";
import { getUserCollectionNameIDs } from "../../../lib/dbTableAction/collectionTableActions";
import { Video, FolderOpen, Play, CircleUserRound } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
	title: "YTB Dashboard",
	description: "This is the dashboard page after signing in",
};
export default async function DashboardPage() {
	const session = await requireSession();
	const userId = session.user.id;

	const [totalVideos, collections] = await Promise.all([
		getVideoNumWithSearchParam(userId, ""),
		getUserCollectionNameIDs(userId),
	]);

	return (
		<div className="flex min-h-screen">
			<Sidebar currentPath="/dashboard" />
			<main className="flex-1 p-6">
				<div className="max-w-4xl mx-auto space-y-8">
					{/* Welcome Card */}
					<div className="card bg-linear-to-br from-primary/10 to-accent/10 border border-primary/20 shadow-md">
						<div className="card-body flex-row items-center gap-6">
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
								<h1 className="card-title text-3xl">
									Welcome back, {session.user.name}!
								</h1>
								<p className="text-base-content/60 mt-1">
									{collections.length === 0 && totalVideos === 0
										? "Start by creating your first collection"
										: "Keep track of your favorite videos and organize them into collections"}
								</p>
							</div>
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
							<Link
								href="/videos"
								className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
							>
								<div className="card-body items-center text-center">
									<Video className="w-12 h-12 text-primary" />
									<h2 className="card-title text-lg">My Videos</h2>
									<p className="text-base-content/60 text-sm">
										{totalVideos} videos
									</p>
								</div>
							</Link>
							<Link
								href="/collection"
								className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
							>
								<div className="card-body items-center text-center">
									<FolderOpen className="w-12 h-12 text-accent" />
									<h2 className="card-title text-lg">My Collections</h2>
									<p className="text-base-content/60 text-sm">
										{collections.length} collections
									</p>
								</div>
							</Link>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
