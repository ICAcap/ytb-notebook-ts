"use client";

import { useRef, useState } from "react";
import VideoPlayer from "./VideoPlayer";
import NoteContainer from "./NoteContainer";
import { VideoDetailType } from "../../../../../lib/dbTableAction/videoTableAction";
import { Note } from "../../../../../generated/prisma";
import CollectionBadgeList from "../../_components/CollectionBadgeList";

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

	// use state of note array list
	const [noteList, setNoteList] = useState(notes ?? []);

	// throttled current play time, fed by VideoPlayer's onTimeUpdate prop (which
	// fires continuously during playback, unlike the player ref's native
	// "timeupdate" DOM event for the YouTube provider); shared with NoteContainer
	// to drive auto-follow scrolling
	const [throttledPlayTime, setThrottledPlayTime] = useState(
		video.lastPlayedTime ?? 0,
	);
	const throttledSetPlayTime = useRef(
		_.throttle(setThrottledPlayTime, 600),
	).current;

	return (
		<div className="flex flex-row gap-3 mt-2">
			<div className="flex flex-col w-full max-w-6xl gap-1">
				<VideoPlayer
					videoId={video.videoId}
					userId={userId}
					url={`https://www.youtube.com/watch?v=${video.youtubeVidID}`}
					playerRef={playerRef}
					lastPlayedTime={video.lastPlayedTime}
					onTimeUpdate={throttledSetPlayTime}
				/>
				<div className="flex mt-2 pl-2">
					<h1 className="text-wrap text-xl font-semibold">
						{`${video.title || "Unknown Video"}`}
					</h1>
				</div>
				<div className="mt-2 pl-2">
					<h2 className="text-sm text-base-content/60">Collections:</h2>
					<div className="flex flex-wrap gap-2 mt-1">
						{video.collections && video.collections.length > 0 ? (
							<CollectionBadgeList collections={video.collections} />
						) : (
							<p className="text-base-content/50">
								Not Part of Any Collections.
							</p>
						)}
					</div>
				</div>
				{/* export all notes button */}
				<button
					title="Export All Notes"
					disabled={noteList.length === 0}
					type="button"
					className="btn btn-lg btn-primary max-w-xl lg:max-w-md mx-auto"
					onClick={() =>
						window.open(`/api/notes/video/${video.videoId}/pdf`, "_blank")
					}
					rel="noopener noreferrer"
				>
					Export All Notes
				</button>
			</div>

			<NoteContainer
				userId={userId}
				videoId={video.videoId}
				noteList={noteList}
				setNoteList={setNoteList}
				playerRef={playerRef}
				throttledPlayTime={throttledPlayTime}
			/>
		</div>
	);
};

export default VideoPlayerAndNotesContainer;
