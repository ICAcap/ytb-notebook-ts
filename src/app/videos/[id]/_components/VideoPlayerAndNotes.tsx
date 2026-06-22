"use client";

import { useRef, useState } from "react";
import VideoPlayer from "./VideoPlayer";
import NoteCard from "../../_components/NoteCard";
import { VideoDetailType } from "../../../../../lib/dbTableAction/videoTableAction";
import { Note } from "../../../../../generated/prisma";
import { Toaster } from "react-hot-toast";

const VideoPlayerAndNotes = ({
	userId,
	video,
	notes,
}: {
	userId: string;
	video: VideoDetailType;
	notes: Note[] | null;
}) => {
	// hooks
	// client state for notes array, to trigger re-rendering after note deletion/modification
	const [noteList, setNoteList] = useState(notes ?? []);
	// ref to bridge the player and the notes container to enable timestamp seeking
	const playerRef = useRef<HTMLVideoElement | null>(null);

	// handler
	// function to trigger current note list filtering out the one note deleted,
	// further trigger the current component re-rendering only
	function handleNoteDeleted(noteId: string) {
		setNoteList((prev) => prev.filter((note) => note.noteId !== noteId));
	}

	const noteCount = noteList ? noteList.length : 0;

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
			{/* note cards */}
			<div className="w-fit">
				<span>There are {noteCount} Notes</span>
				<br />
				<div>
					{noteCount > 0 ? (
						noteList.map((note) => (
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
								onDeleted={() => handleNoteDeleted(note.noteId)}
							/>
						))
					) : (
						<span className="text-2xl label">
							No notes related to this video...
						</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default VideoPlayerAndNotes;
