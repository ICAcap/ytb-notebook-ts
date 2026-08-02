"use client";

import ReactPlayer from "react-player";
import { RefObject, useRef } from "react";
import { updateVideoPlayedTime } from "../../../../../lib/dbTableAction/videoTableAction";
import { memo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface VideoPlayerProps {
	videoId: string;
	userId: string;
	url: string;
	playerRef?: RefObject<HTMLVideoElement | null>;
	lastPlayedTime?: number;
	onTimeUpdate?: (seconds: number) => void;
}

const _ = require("lodash"); // for debounce & throttle purpose

// Component
const VideoPlayer = ({
	videoId,
	userId,
	url,
	playerRef,
	lastPlayedTime = 0,
	onTimeUpdate,
}: VideoPlayerProps) => {
	// hooks
	const isDemoRoute = usePathname().startsWith("/demo");
	const internalRef = useRef<HTMLVideoElement | null>(null);
	// fall back to internal hook if need to use the component by itself
	const reactPlayerRef = playerRef ?? internalRef;

	// startAt search param
	const searchParams = useSearchParams();
	const startAtParam = searchParams.get("startAt");
	const startAt = startAtParam ? Number(startAtParam) : undefined;

	const playerAlreadyMounted = useRef(false);

	// heartbeat saves position every fixed seconds while playing
	const heartbeat = useRef(
		_.throttle(async (seconds: number) => {
			if (isDemoRoute) return;
			await updateVideoPlayedTime(videoId, userId, seconds);
		}, 30000),
	).current;

	// helper function to update the video played time
	async function handleTimePlayedUpdate() {
		if (isDemoRoute) return;
		if (reactPlayerRef.current) {
			const currentTimeSeconds = Math.max(
				0,
				Math.min(
					Math.floor(reactPlayerRef.current.currentTime),
					Math.floor(reactPlayerRef.current.duration),
				),
			);
			await updateVideoPlayedTime(videoId, userId, currentTimeSeconds);
		}
	}

	// debounce saves final position (after seek/pause ends)
	const debouncedHandleTimePlayedUpdate = _.debounce(
		handleTimePlayedUpdate,
		3000,
	);

	return (
		<div className="w-full">
			<div className="aspect-video">
				<ReactPlayer
					ref={reactPlayerRef}
					src={url}
					controls={true}
					width="100%"
					height="100%"
					playing={true}
					onReady={() => {
						// Set the player's current time to the last played time when it's ready,
						// (?startAt=<seconds> takes precedence over the persisted lastPlayedTime),
						// e.g. when navigating here from a note's timestamp badge
						// but only on the initial player mount
						if (reactPlayerRef.current && !playerAlreadyMounted.current) {
							const seekTo = startAt ?? lastPlayedTime;
							reactPlayerRef.current.currentTime =
								seekTo >= reactPlayerRef.current.duration - 1 ? 0 : seekTo;
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
						if (reactPlayerRef.current) {
							const seconds = Math.floor(reactPlayerRef.current.currentTime);
							heartbeat(seconds);
							onTimeUpdate?.(seconds);
						}
					}}
				/>
			</div>
		</div>
	);
};

export default memo(VideoPlayer);
