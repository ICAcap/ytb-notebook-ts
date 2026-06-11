"use client";

import ReactPlayer from "react-player";
import { useRef } from "react";
import { updateVideoPlayedTime } from "../../../../../lib/dbTableAction/videoTableAction";

interface VideoPlayerProps {
	videoId: string;
	url: string;
	lastPlayedTime?: number;
}

const _ = require("lodash"); // for debounce purpose

// Component
const VideoPlayer = ({
	videoId,
	url,
	lastPlayedTime = 0,
}: VideoPlayerProps) => {
	const playerAlreadyMounted = useRef(false);
	const playerRef = useRef<HTMLVideoElement | null>(null);

	// heartbeat saves position every 15s while playing
	const heartbeat = useRef(
		_.throttle(async (seconds: number) => {
			await updateVideoPlayedTime(videoId, seconds);
		}, 30000),
	).current;

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
			// console.log(`${currentTimeSeconds}`);
			await updateVideoPlayedTime(videoId, currentTimeSeconds);
		}
	}

	// debounce saves final position (after seek/pause ends)
	const debouncedHandleTimePlayedUpdate = _.debounce(
		handleTimePlayedUpdate,
		3000,
	);

	return (
		<div className="w-full max-w-4xl mx-auto mt-6">
			<div className="aspect-video">
				<ReactPlayer
					ref={playerRef}
					src={url}
					controls={true}
					width="100%"
					height="100%"
					playing={true}
					onReady={() => {
						// Set the player's current time to the last played time when it's ready,
						// but only on the initial player mount
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
					onTimeUpdate={() => {
						if (playerRef.current) {
							const seconds = Math.floor(playerRef.current.currentTime);
							heartbeat(seconds);
						}
					}}
				/>
			</div>
		</div>
	);
};

export default VideoPlayer;
