"use client";

import { useRef, useState } from "react";
import VideoPlayer from "./VideoPlayer";
import NoteContainer from "./NoteContainer";
import { VideoDetailType } from "../../../../../lib/dbTableAction/videoTableAction";
import { Note } from "../../../../../generated/prisma";

const _ = require("lodash"); // for throttle purpose

const VideoPlayerAndNotesContainer = ({
	userId,
	video,
	notes,
}: {
	userId: string;
	video: VideoDetailType;
	notes: Note[] | null;
}) => {
	// hooks
	// ref to bridge the player and the notes container to enable timestamp seeking
	const playerRef = useRef<HTMLVideoElement | null>(null);

	// throttled current play time, fed by VideoPlayer's onTimeUpdate prop (which
	// fires continuously during playback, unlike the player ref's native
	// "timeupdate" DOM event for the YouTube provider); shared with NoteContainer
	// to drive auto-follow scrolling
	const [throttledPlayTime, setThrottledPlayTime] = useState(
		video.lastPlayedTime ?? 0,
	);
	const throttledSetPlayTime = useRef(
		_.throttle(setThrottledPlayTime, 750),
	).current;

	return (
		<div className="flex flex-row gap-3 mt-2">
			<VideoPlayer
				videoId={video.videoId}
				userId={userId}
				url={`https://www.youtube.com/watch?v=${video.youtubeVidID}`}
				playerRef={playerRef}
				lastPlayedTime={video.lastPlayedTime}
				onTimeUpdate={throttledSetPlayTime}
			/>

			<NoteContainer
				userId={userId}
				videoId={video.videoId}
				notes={notes}
				playerRef={playerRef}
				throttledPlayTime={throttledPlayTime}
			/>
		</div>
	);
};

export default VideoPlayerAndNotesContainer;
