"use client";

import ReactPlayer from "react-player";
import { useRef } from "react";
import { updateVideoPlayedTime } from "../../../../../lib/dbTableAction/videoTableAction";

interface VideoPlayerProps {
	videoId: string;
	userId: string;
	url: string;
	lastPlayedTime?: number;
}

const _ = require("lodash"); // for debounce

// Component
const VideoPlayer = ({
	videoId,
	userId,
	url,
	lastPlayedTime = 0,
}: VideoPlayerProps) => {
	const playerAlreadyMounted = useRef(false);
	const playerRef = useRef<HTMLVideoElement | null>(null);
	const timePlayedRef = useRef(lastPlayedTime);

	// helper function to update the video played time
	async function handleTimePlayedUpdate() {
		if (playerRef.current) {
			const currentTimeSeconds = Math.max(
				0,
				Math.min(
					Math.floor(playerRef.current.currentTime),
					Math.floor(playerRef.current.duration),
				),
			);
			timePlayedRef.current = currentTimeSeconds;
			// console.log(`${currentTimeSeconds}`);
			await updateVideoPlayedTime(userId, videoId, timePlayedRef.current);
		}
	}

	// debounce saves final position (after seek/pause ends)
	const debouncedHandleTimePlayedUpdate = _.debounce(
		handleTimePlayedUpdate,
		3000,
	);

	return (
		<div className="w-full max-w-4xl mx-auto mt-6">
			<div className="relative w-full pb-[56.25%]">
				<ReactPlayer
					ref={playerRef}
					src={url}
					controls={true}
					width="100%"
					height="100%"
					className="absolute top-0 left-0"
					playing={false}
					onReady={() => {
						// Set the player's current time to the last played time when it's ready, but only on the initial mount
						if (playerRef.current && !playerAlreadyMounted.current) {
							playerRef.current.currentTime = lastPlayedTime;
							playerAlreadyMounted.current = true;
						}
					}}
					onError={(e) => {
						try {
							debouncedHandleTimePlayedUpdate();
						} finally {
							console.error("Error loading video:", e);
						}
					}}
					onPlay={debouncedHandleTimePlayedUpdate}
					onPause={debouncedHandleTimePlayedUpdate}
					onEnded={debouncedHandleTimePlayedUpdate}
					onSeeked={debouncedHandleTimePlayedUpdate}
				/>
			</div>
		</div>
	);
};

export default VideoPlayer;
