"use client";

import { useRef, useState } from "react";
import NoteCard from "../../_components/NoteCard";
import { Note } from "../../../../../generated/prisma";
import { StickyNoteOff, Plus, Minus, AlertCircle } from "lucide-react";
import EditableNoteCard from "../../_components/EditableNoteCard";
import { useVirtualizer } from "@tanstack/react-virtual";
import Modal from "@/_components/ModalSkeleton";
import { memo } from "react";

// component
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
	// hooks //
	// client state for notes array, to trigger re-rendering after note deletion/modification
	const [noteList, setNoteList] = useState(notes ?? []);
	// bool to toggle Note addition collapsible on/off
	const [openCollapse, setOpenCollapse] = useState(false);
	// bool to toggle new note cancel modal
	const [openNoteCancelModal, setOpenNoteCancelModal] = useState(false);

	// virtualization stuff
	const scrollRef = useRef<HTMLDivElement>(null);
	const virtualizer = useVirtualizer({
		count: noteList.length,
		estimateSize: () => 0,
		getScrollElement: () => scrollRef.current,
	});
	const virtualItems = virtualizer.getVirtualItems();

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
		<div
			ref={scrollRef}
			// h-[90dvh]
			className="flex flex-col items-center grow h-dvh overflow-auto"
		>
			{/* Notes count + Add note collapsible (by daisy UI) */}
			<div className="sticky top-0 w-full bg-accent rounded-t-lg z-10 px-1">
				<div className="flex flex-col py-2 gap-2">
					<span className="badge badge-info badge-sm ml-2 font-bold">
						{noteCount} Notes
					</span>
					<div className="collapse collapse-arrow px-1">
						<input
							type="checkbox"
							checked={openCollapse}
							onChange={(e) => {
								if (e.target.checked) {
									setOpenCollapse(true);
								} else {
									setOpenNoteCancelModal(true);
									// pause the vid as well
									playerRef.current?.pause();
								}
							}}
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
			{noteCount > 0 ? (
				<div
					className="relative w-full rounded-b-lg"
					style={{ height: `${virtualizer.getTotalSize()}px` }}
				>
					{/* Note cards with dynamic virtualization - reference: https://www.youtube.com/watch?v=DBdo7mmuGx4&t=845s */}
					<div
						className="absolute w-full"
						style={{
							transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
						}}
					>
						{virtualItems.map((vItem) => {
							const note = sortedNoteList[vItem.index];
							return (
								<div
									key={vItem.key}
									data-index={vItem.index}
									ref={virtualizer.measureElement}
									className="mb-3 px-1"
								>
									<NoteCard
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
								</div>
							);
						})}
					</div>
				</div>
			) : (
				// empty notes placeholder
				<div className="w-full border border-dashed rounded-b-lg p-4 flex items-center justify-center min-h-50">
					<span className="card card-xl card-dash text-center items-center text-2xl font-semibold">
						<p>No notes related to this video</p>
						<br />
						<p>
							<StickyNoteOff size={80} />
						</p>
					</span>
				</div>
			)}

			<Modal
				isOpen={openNoteCancelModal}
				onClose={() => setOpenNoteCancelModal(false)}
			>
				<div role="dialog" className="flex flex-col gap-6">
					<div className="flex items-center gap-3">
						<AlertCircle size={40} className="text-error shrink-0" />
						<span className="text-lg font-semibold">
							Are you sure you want to discard this new note?
						</span>
					</div>
					<div className="flex gap-3 justify-between">
						<button
							onClick={() => setOpenNoteCancelModal(false)}
							className="btn btn-outline flex-1"
						>
							Keep
						</button>
						<button
							className="btn btn-error flex-1"
							onClick={() => {
								setOpenNoteCancelModal(false);
								setOpenCollapse(false);
							}}
						>
							Discard
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default memo(NoteContainer);
