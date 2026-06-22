"use client";

import { useRef } from "react";
import VideoPlayer from "./VideoPlayer";
import NoteContainer from "./NoteContainer";
import { VideoDetailType } from "../../../../../lib/dbTableAction/videoTableAction";
import { Note } from "../../../../../generated/prisma";
import { Toaster } from "react-hot-toast";

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

	return (
		<div className="flex gap-2 mt-1">
			<Toaster />
			<div className="flex-1">
				<VideoPlayer
					videoId={video.videoId}
					userId={userId}
					url={`https://www.youtube.com/watch?v=${video.youtubeVidID}`}
					playerRef={playerRef}
					lastPlayedTime={video.lastPlayedTime}
				/>
			</div>
			<NoteContainer notes={notes} playerRef={playerRef} />
		</div>
	);
};

export default VideoPlayerAndNotesContainer;
