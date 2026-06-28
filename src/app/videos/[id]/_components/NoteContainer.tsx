"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import NoteCard from "../../_components/NoteCard";
import { Note } from "../../../../../generated/prisma";
import { StickyNoteOff, Plus, Minus, AlertCircle } from "lucide-react";
import EditableNoteForm from "../../_components/EditableNoteForm";
import { useVirtualizer } from "@tanstack/react-virtual";
import Modal from "@/_components/ModalSkeleton";
import { memo } from "react";

const _ = require("lodash"); // for debounce & throttle purpose

// component
const NoteContainer = ({
	userId,
	videoId,
	notes,
	playerRef,
	throttledPlayTime,
}: {
	userId: string;
	videoId: string;
	notes: Note[] | null;
	playerRef: React.RefObject<HTMLVideoElement | null>;
	throttledPlayTime: number;
}) => {
	// hooks //
	// client state for notes array, to trigger re-rendering after note deletion/modification
	const [noteList, setNoteList] = useState(notes ?? []);
	// bool to toggle Note addition collapsible on/off
	const [openCollapse, setOpenCollapse] = useState(false);
	// bool to toggle new note cancel modal
	const [openNoteCancelModal, setOpenNoteCancelModal] = useState(false);

	// bool to enable auto scrolling
	const autoscrollEnabled = useRef(true);

	// virtualization stuffs
	// reference:https://www.youtube.com/watch?v=DBdo7mmuGx4
	const scrollRef = useRef<HTMLDivElement>(null);
	const virtualizer = useVirtualizer({
		count: noteList.length,
		estimateSize: () => 0,
		getScrollElement: () => scrollRef.current,
		overscan: 3,
	});
	const virtualItems = virtualizer.getVirtualItems();

	// handler/helper //
	// function to trigger current note list filtering out the one note deleted,
	// further trigger the current component re-rendering only
	const handleNoteDeleted = useCallback((noteId: string) => {
		setNoteList((prev) => prev.filter((note) => note.noteId !== noteId));
	}, []);

	// function to update an existing note or append a new one to the list
	// to further trigger the current component re-rendering only
	const handleNoteUpserted = useCallback((updated: Note) => {
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
	}, []);

	// function to help pause auto-scrolling when there is a note in editing mode
	const handleMarkNoteInEdition = useCallback(() => {
		autoscrollEnabled.current = false;
	}, []);

	// note num & sort note
	const noteCount = noteList ? noteList.length : 0;
	const sortedNoteList = useMemo(
		() =>
			noteList.toSorted((a, b) => {
				if (a.startTime !== b.startTime) {
					return a.startTime - b.startTime;
				}
				return a.createdAt.getTime() - b.createdAt.getTime();
			}),
		[noteList],
	);

	// from lodash
	// last note whose startTime <= current play time.
	// sortedLastIndexBy finds where { startTime: throttledPlayTime } would be
	// inserted into sortedNoteList to keep it sorted by startTime, landing after
	// any ties ("last"). Subtracting 1 turns that insert position into the index
	// of the floor element (last note with startTime <= throttledPlayTime).
	const activeIndex =
		_.sortedLastIndexBy(
			sortedNoteList,
			{ startTime: throttledPlayTime },
			(n: Note) => n.startTime,
		) - 1;

	// handler auto scroll to active row via virtualizer
	const autoScrollToIdx = () => {
		virtualizer.scrollToIndex(activeIndex >= 0 ? activeIndex : 0, {
			align: "center",
			behavior: "auto",
		});
	};

	useEffect(() => {
		if (autoscrollEnabled.current) {
			autoScrollToIdx();
		}
	}, [activeIndex]);

	// handle disabling auto scrolling
	// and then restore after a period
	const tempDisableAutoscroll = _.throttle(() => {
		const pauseMs = 4000;
		// only trigger if the player is currently playing and the auto-scrolling is not manual set to disabled by user checkbox
		const paused = playerRef.current?.paused;
		const checkboxChecked = (
			document.getElementById("autoscroll-checkbox") as HTMLInputElement
		).checked;

		if (!paused && checkboxChecked) {
			(
				document.getElementById("auto-follow-label") as HTMLLabelElement
			).textContent = "Auto-follow paused";
			autoscrollEnabled.current = false;
			setTimeout(() => {
				autoscrollEnabled.current = true;
				(
					document.getElementById("auto-follow-label") as HTMLLabelElement
				).textContent = "Auto-follow?";
			}, pauseMs);
		}
	}, 300); // Limit execution

	const virtualDiv = document.getElementById("virtual-container");
	virtualDiv?.addEventListener("wheel", tempDisableAutoscroll);

	// component
	return (
		<div
			ref={scrollRef}
			className="flex flex-col border-l-2 items-center flex-1 min-w-0 h-dvh overflow-auto"
			style={{ height: "98dvh" }}
		>
			{/* current note position + Notes count + Add note collapsible (by daisy UI) */}
			<div className="sticky top-0 grow-0 w-full min-w-0 bg-accent rounded-t-lg z-10 px-1">
				<div className="flex flex-col py-2 gap-2">
					<div className="flex flex-row gap-2 justify-between">
						<button
							title="click to jump to current note"
							className="btn btn-xs btn-info ml-2 font-bold"
							onClick={_.throttle(autoScrollToIdx, 300)}
						>
							{activeIndex + 1}/{noteCount} Notes
						</button>
						<div className="flex flex-row gap-2 mr-1">
							<label id="auto-follow-label" className="badge">
								Auto-follow?
							</label>
							<input
								id="autoscroll-checkbox"
								type="checkbox"
								checked={autoscrollEnabled.current}
								onChange={(e) => {
									autoscrollEnabled.current = e.target.checked;
								}}
								className="checkbox checkbox-info"
							/>
						</div>
					</div>
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
							<EditableNoteForm
								key={openCollapse ? "open" : "closed"} //use key change to force remount the editor thus reset the form
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
						id="virtual-container"
					>
						{virtualItems.map((vItem) => {
							const note = sortedNoteList[vItem.index];
							return (
								<div
									key={vItem.key}
									data-index={vItem.index}
									ref={virtualizer.measureElement}
									className={`${vItem.index === activeIndex && "aura aura-lx aura-holo"}  w-full max-w-full mb-4`}
								>
									<div className="bg-base-100">
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
											onDeleted={handleNoteDeleted}
											onUpdated={handleNoteUpserted}
											onOpenEdit={handleMarkNoteInEdition}
										/>
									</div>
								</div>
							);
						})}
						<div
							key={"end-of-notes"}
							data-index={noteCount}
							ref={virtualizer.measureElement}
							className="border-t-2 mt-1 border-dashed text-center"
						>
							<span className="text-lg font-semibold">End of the Notes</span>
						</div>
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
