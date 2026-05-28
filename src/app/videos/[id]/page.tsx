import React from "react";
import Sidebar from "../../../../components/sidebar";
import VideoPlayer from "./_components/VideoPlayer";
import prisma from "../../../../lib/prisma";

type video = {
	vidId: string;
	title: string;
	url: string;
	collections: string[];
};

// const demoVideo: video = {
// 	vidId: "aaa-bbb-ccc",
// 	title: "Never Gonna Give You Up",
// 	url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
// 	collections: [],
// };

const VidView = (video: video) => {
	return (
		<div>
			<Sidebar currentPath="/videos" />
			<main className="ml-64 p-6">
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
			</main>
		</div>
	);
};

export default VidView;
