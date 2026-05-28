import React from "react";
import ReactPlayer from "react-player";

interface VideoPlayerProps {
	url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
	return (
		<div className="w-full max-w-4xl mx-auto mt-6">
			<div className="relative w-full pb-[56.25%]">
				<ReactPlayer
					src={url}
					controls={true}
					width="100%"
					height="100%"
					className="absolute top-0 left-0"
				/>
			</div>
		</div>
	);
};

export default VideoPlayer;
