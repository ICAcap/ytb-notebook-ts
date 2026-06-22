"use client";

import { useState } from "react";
import NoteCard from "../../_components/NoteCard";
import { Note } from "../../../../../generated/prisma";

const NoteContainer = ({
	notes,
	playerRef,
}: {
	notes: Note[] | null;
	playerRef: React.RefObject<HTMLVideoElement | null>;
}) => {
	// hooks
	// client state for notes array, to trigger re-rendering after note deletion/modification
	const [noteList, setNoteList] = useState(notes ?? []);

	// handler
	// function to trigger current note list filtering out the one note deleted,
	// further trigger the current component re-rendering only
	function handleNoteDeleted(noteId: string) {
		setNoteList((prev) => prev.filter((note) => note.noteId !== noteId));
	}

	// function to update an existing note or append a new one to the list
	// to further trigger the current component re-rendering only
	function handleNoteUpdated(updated: Note) {
		setNoteList((prev) => {
			const existing = prev.find((note) => note.noteId === updated.noteId);
			if (existing) {
				return prev.map((note) =>
					note.noteId === updated.noteId ? updated : note,
				);
			} else {
				return [...prev, updated];
			}
		});
	}

	const noteCount = noteList ? noteList.length : 0;
	const sortedNoteList = noteList.toSorted((a, b) => {
		if (a.startTime !== b.startTime) {
			return a.startTime - b.startTime;
		}
		return a.createdAt.getTime() - b.createdAt.getTime();
	});

	return (
		<div className="w-fit">
			<span className="font-bold">There are {noteCount} Notes</span>
			<br />
			<div>
				{noteCount > 0 ? (
					sortedNoteList.map((note) => (
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
							onUpdated={handleNoteUpdated}
						/>
					))
				) : (
					<span className="text-2xl label">
						No notes related to this video...
					</span>
				)}
			</div>
		</div>
	);
};

export default NoteContainer;
