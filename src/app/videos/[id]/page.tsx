import Sidebar from "../../../../components/sidebar";
import VideoPlayer from "./_components/VideoPlayer";
import { prisma } from "../../../lib/prisma";

type video = {
	vidId: string;
	title: string;
	url: string;
	collections: string[];
};

/**
 * Fetch video data based on the provided ID from the URL parameters
 * use prisma to query the database for the video details and its associated collections
 * in case the video is not found, return null to handle the "Video not found" scenario in the UI
 */
async function getVideoById(id: string): Promise<video | null> {
	// console.log("Fetching video with ID:", id);
	const vid = await prisma.video.findUnique({
		where: { videoId: id },
		include: { collections: true },
	});

	if (vid) {
		return {
			vidId: vid.videoId,
			title: vid.title,
			url: vid.url,
			collections: vid.collections.map((c) => c.collectionName) || [],
		};
	}

	return null;
}

// async component
export default async function VidViewPage({
	params,
}: {
	params: { id: string };
}) {
	const videoId = (await params).id;
	const video = await getVideoById(videoId);

	return (
		<div>
			<Sidebar currentPath="/videos" />
			<main className="ml-64 p-6">
				{video ? (
					<>
						<h1 className="text-4xl text-wrap">{`${video.title || "Unknown Title"}`}</h1>
						<div className="mt-4 justify-evenly">
							<h2 className="text-xl text-gray-400">Collections:</h2>
							<div className="flex flex-wrap gap-2 mt-2">
								{video.collections && video.collections.length > 0 ? (
									video.collections.map((collection, index) => (
										<span
											key={index}
											className="bg-red-400 px-3 py-1 rounded-full text-sm"
										>
											{collection}
										</span>
									))
								) : (
									<p className="text-gray-500">No collections available.</p>
								)}
							</div>
						</div>
						<VideoPlayer url={video.url} />
					</>
				) : (
					<h1 className="text-4xl text-center">Video not found</h1>
				)}
			</main>
		</div>
	);
}
