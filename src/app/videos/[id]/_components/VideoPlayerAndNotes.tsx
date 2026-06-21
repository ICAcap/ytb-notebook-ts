"use client";

import { useRef } from "react";
import VideoPlayer from "./VideoPlayer";
import NoteCard from "../../_components/NoteCard";
import { VideoDetailType } from "../../../../../lib/dbTableAction/videoTableAction";
import { Note } from "../../../../../generated/prisma";

const VideoPlayerAndNotes = ({
	userId,
	video,
	notes,
}: {
	userId: string;
	video: VideoDetailType;
	notes: Note[] | null;
}) => {
	// ref to bridge the player and the notes container to enable timestamp seeking
	const playerRef = useRef<HTMLVideoElement | null>(null);

	const noteCount = notes ? notes.length : 0;

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
				<span>There are {noteCount} Notes</span>
				<div>
					{notes ? (
						notes.map((note) => (
							<NoteCard
								key={note.noteId}
								noteId={note.noteId}
								userId={note.userId}
								videoId={note.videoId}
								startTime={note.startTime}
								endTime={note.endTime}
								content={note.content}
								color={note.color}
								screenshotUrl={note.screenshotUrl}
								createdAt={note.createdAt}
								updatedAt={note.updatedAt}
								playerRef={playerRef}
							/>
						))
					) : (
						<span>No Notes...</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default VideoPlayerAndNotes;
