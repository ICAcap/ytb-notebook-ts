"use client";

import { useRef } from "react";
import { sampleJson } from "@/app/tiptap/page";
import VideoPlayer from "./VideoPlayer";
import NoteCard from "../../_components/NoteCard";
import { VideoDetailType } from "../../../../../lib/dbTableAction/videoTableAction";

const VideoPlayerAndNotes = ({
	userId,
	video,
}: {
	userId: string;
	video: VideoDetailType;
}) => {
	// ref to bridge the player and the notes container to enable timestamp seeking
	const playerRef = useRef<HTMLVideoElement | null>(null);

	return (
		<div className="flex gap-6 mt-4">
			<div className="flex-1">
				<VideoPlayer
					videoId={video.videoId}
					userId={userId}
					url={`https://www.youtube.com/watch?v=${video.youtubeVidID}`}
					playerRef={playerRef}
					lastPlayedTime={video.lastPlayedTime}
				/>
			</div>
			{/* testing with one note card */}
			<div className="w-80">
				<NoteCard
					content={sampleJson}
					noteId={"1"}
					userId={"1"}
					videoId={"1"}
					startTime={800}
					endTime={900}
					color={"#FF0000"}
					screenshotUrl={null}
					createdAt={new Date("2023-05-12T10:30:00Z")} // Mock date for initial creation.
					updatedAt={new Date("2023-06-20T15:45:00Z")} // Mock date for last modification.
					playerRef={playerRef}
				/>
			</div>
		</div>
	);
};

export default VideoPlayerAndNotes;
