"use client";

import { useState } from "react";
import NoteCard from "../../_components/NoteCard";
import { Note } from "../../../../../generated/prisma";
import { StickyNoteOff, Plus, Minus } from "lucide-react";
import EditableNoteCard from "../../_components/EditableNoteCard";

const NoteContainer = ({
	userId,
	videoId,
	notes,
	playerRef,
}: {
	userId: string;
	videoId: string;
	notes: Note[] | null;
	playerRef: React.RefObject<HTMLVideoElement | null>;
}) => {
	// hooks
	// client state for notes array, to trigger re-rendering after note deletion/modification
	const [noteList, setNoteList] = useState(notes ?? []);
	// bool to toggle Note addition collapsible on/off
	const [openCollapse, setOpenCollapse] = useState(false);

	// handler
	// function to trigger current note list filtering out the one note deleted,
	// further trigger the current component re-rendering only
	function handleNoteDeleted(noteId: string) {
		setNoteList((prev) => prev.filter((note) => note.noteId !== noteId));
	}

	// function to update an existing note or append a new one to the list
	// to further trigger the current component re-rendering only
	function handleNoteUpserted(updated: Note) {
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
		<div className="flex flex-col items-center w-md">
			{/* Notes count + Add note collapsible (by daisy UI) */}
			<div className="sticky top-0 w-full bg-accent rounded-t-lg z-10">
				<div className="flex flex-col py-2 gap-2">
					<span className="label px-4 font-bold">{noteCount} Notes</span>
					<div className="collapse collapse-arrow">
						<input
							type="checkbox"
							checked={openCollapse}
							onChange={(e) => setOpenCollapse(e.target.checked)}
						/>
						<div className="collapse-title btn btn-sm border-secondary-content bg-secondary font-semibold text-secondary-content text-center">
							<div className="flex items-center gap-2">
								{openCollapse ? <Minus size={20} /> : <Plus size={20} />}
								<span>{openCollapse ? "Cancel New Note" : "Add New Note"}</span>
							</div>
						</div>
						<div className="collapse-content bg-base-200">
							<EditableNoteCard
								key={openCollapse ? "open" : "closed"} //use key to trigger editor re-render/reset
								noteId={""}
								userId={userId}
								videoId={videoId}
								startTime={playerRef.current?.currentTime || 0}
								endTime={playerRef.current?.currentTime || 0}
								content={null}
								color={""}
								screenshotUrl={null}
								playerRef={playerRef}
								onUpdated={(note) => {
									handleNoteUpserted(note);
									setOpenCollapse(false);
								}}
							/>
						</div>
					</div>
				</div>
			</div>
			{/* Note cards */}
			<div className="w-full border border-dashed rounded-b-lg p-4 max-h-150 overflow-y-auto">
				<div className="mt-1">
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
								onUpdated={handleNoteUpserted}
							/>
						))
					) : (
						<span className="card card-xl card-dash text-center items-center text-2xl font-semibold">
							<p>No notes related to this video</p>
							<br />
							<p>
								<StickyNoteOff size={80} />
							</p>
						</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default NoteContainer;
