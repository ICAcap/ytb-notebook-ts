import Sidebar from "../../../components/sidebar";
import requireSession from "../../../lib/requireSession";
import VideoCard from "./_components/VideoCard";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Videos",
	description: "This is the page showing all the videos",
};

export default async function VideoPage() {
	await requireSession();

	return (
		<div className="flex min-h-screen">
			<Sidebar currentPath="/videos" />
			<main className="flex-1 p-6">
				<h1 className="text-3xl text-center">Video Page</h1>
				<VideoCard
					videoUrl={"https://www.youtube.com/watch?v=Rr_hHavuq-w"}
					title={"when phones were fun"}
					timestamp={33002}
					videoId={"dasfsadfa"}
				/>
				<VideoCard
					videoUrl="https://www.youtube.com/shorts/Ed0FkH5cZlw"
					title="Frutiger 2000s"
					timestamp={22}
					videoId={"dasfsadfa"}
				/>
			</main>
		</div>
	);
}
