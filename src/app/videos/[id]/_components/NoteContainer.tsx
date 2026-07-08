"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import NoteCard from "../../_components/NoteCard";
import { Note } from "../../../../../generated/prisma";
import { StickyNoteOff, Plus, Minus, AlertCircle, Search } from "lucide-react";
import EditableNoteForm from "../../_components/EditableNoteForm";
import { useVirtualizer } from "@tanstack/react-virtual";
import Modal from "@/_components/ModalSkeleton";
import { memo } from "react";
import { Toaster, toast } from "react-hot-toast";
import Fuse from "fuse.js";
import { JSONContent } from "@tiptap/react";
import { generateText } from "@tiptap/core";
import { TiptapExtensions } from "@/_components/RichTextEditor/TiptapExtension";

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

	// function to pause auto-scrolling when there is a note in editing mode
	const handleMarkNoteInEdition = useCallback(() => {
		(
			document.getElementById("autoscroll-checkbox") as HTMLInputElement
		).checked = false;
		toast("Note card edition detected; pausing auto-scroll.", {
			id: "ne-scroll-info",
			position: "bottom-center",
			toasterId: "note-container",
		});
	}, []);

	// note num & sort note & sort note content string
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

	const sortedNoteStrList = useMemo<string[]>(
		() =>
			sortedNoteList.map((n) =>
				//https://github.com/ueberdosis/tiptap/discussions/3114
				generateText(n.content as JSONContent, TiptapExtensions),
			),
		[sortedNoteList],
	);
	// for search filtering note usage
	// set up fuse for note search; only rebuild the index when the underlying
	// text actually changes, not on every render
	const fuse = useMemo(
		() =>
			new Fuse(sortedNoteStrList, {
				threshold: 0.3,
				ignoreLocation: true,
				useTokenSearch: true,
				tokenMatch: "all",
			}),
		[sortedNoteStrList],
	);

	// kept up to date every render so the debounced search callback below
	// (frozen at first render via useRef) always searches against the
	// current notes instead of whichever list existed when it was created
	const latestSearchDataRef = useRef({ fuse, sortedNoteList });
	latestSearchDataRef.current = { fuse, sortedNoteList };

	const [searchedNoteList, setSearchedNoteList] = useState(sortedNoteList);
	const noteCount = searchedNoteList ? searchedNoteList.length : 0;

	// pure filter: given a query, fuse index, and sorted list, return the
	// matching notes (or the full list when the query is empty) - shared by
	// both the debounced "user typing" path and the immediate "data changed" path
	const filterNotes = (
		searchQ: string,
		fuse: Fuse<string>,
		sortedNoteList: Note[],
	) => {
		if (!searchQ.trim()) return sortedNoteList;
		const searchedIdxList = fuse
			.search(searchQ)
			.map((result) => result.refIndex);
		// map indices back to the sorted list to maintain chronological order.
		return searchedIdxList.map((idx) => sortedNoteList[idx]);
	};

	const handleSearchNote = useRef(
		_.debounce((searchQ: string) => {
			const { fuse, sortedNoteList } = latestSearchDataRef.current;
			const filteredNotes = filterNotes(searchQ, fuse, sortedNoteList);
			setSearchedNoteList(filteredNotes);

			// show the best ranked by scrolling, only when the user actually typed a query
			if (searchQ.trim() && filteredNotes.length > 0)
				virtualizer.scrollToIndex(0, {
					align: "start",
					behavior: "auto",
				});
		}, 300), // Delay execution to avoid excessive re-renders during typing.
	);

	useEffect(() => {
		// re-apply the current search query immediately (no debounce, no scroll)
		// so notes added/edited/deleted while a search is active don't flash the
		// full unfiltered list before the debounced handler catches up
		const currentSearchQ =
			(document.getElementById("search-note-q") as HTMLInputElement).value ??
			"";
		setSearchedNoteList(filterNotes(currentSearchQ, fuse, sortedNoteList));
	}, [sortedNoteList, fuse]);

	// internal auto-scroll flag for temporary pauses (e.g. wheel-scroll timer);
	// ANDed with the user's auto-follow checkbox, which takes priority -
	// i.e. this flag flipping back to true
	const autoscrollEnabled = useRef(true);

	// virtualization stuffs
	// reference:https://www.youtube.com/watch?v=DBdo7mmuGx4
	const scrollRef = useRef<HTMLDivElement>(null);
	const virtualizer = useVirtualizer({
		count: searchedNoteList.length,
		estimateSize: () => 0,
		getScrollElement: () => scrollRef.current,
		getItemKey: (index) => searchedNoteList[index]?.noteId ?? index,
		overscan: 3,
	});
	const virtualItems = virtualizer.getVirtualItems();

	// last note whose startTime <= current play time.
	// sortedLastIndexBy finds where { startTime: throttledPlayTime } would be
	// inserted into sortedNoteList to keep it sorted by startTime, landing after
	// any ties ("last"). Subtracting 1 turns that insert position into the index
	// of the floor element (last note with startTime <= throttledPlayTime).
	const activeIndex =
		_.sortedLastIndexBy(
			searchedNoteList,
			{ startTime: throttledPlayTime },
			(n: Note) => n.startTime,
		) - 1;

	// handler auto scroll to active row via virtualizer
	const autoScrollToCurrIdx = () => {
		virtualizer.scrollToIndex(activeIndex >= 0 ? activeIndex : 0, {
			align: "center",
			behavior: "auto",
		});
	};

	// kept up to date every render so the long-lived debounced/throttled
	// callbacks below (frozen at first render via useRef) always resync to
	// the current note instead of whichever one was active on mount
	const autoScrollToCurrIdxRef = useRef(autoScrollToCurrIdx);
	autoScrollToCurrIdxRef.current = autoScrollToCurrIdx;

	useEffect(() => {
		const userOverrideScrollEnabled = (
			document.getElementById("autoscroll-checkbox") as HTMLInputElement
		).checked;
		if (autoscrollEnabled.current && userOverrideScrollEnabled) {
			autoScrollToCurrIdx();
		}
	}, [activeIndex]);

	// handle disabling auto scrolling, then restoring after a period of inactivity
	// only the resuming is debounced, so each additional
	// wheel event within the container resets the countdown instead of
	// scheduling a competing timer.
	const resumeAutoscroll = useRef(
		_.debounce(() => {
			autoscrollEnabled.current = true;

			const userOverrideScrollEnabled = (
				document.getElementById("autoscroll-checkbox") as HTMLInputElement
			).checked;

			if (userOverrideScrollEnabled) {
				toast("Resume auto-scroll", {
					id: "ms-scroll-info",
					position: "bottom-center",
					toasterId: "note-container",
				});
				autoScrollToCurrIdxRef.current();
			}
		}, 7000),
	);

	const handleTempDisableAutoscroll = () => {
		autoscrollEnabled.current = false;
		resumeAutoscroll.current();
	};

	const toastWheel = useRef(
		_.throttle(
			() => {
				toast("Manual scrolling detected; pausing auto-scroll temporarily.", {
					id: "ms-scroll-info",
					position: "bottom-center",
					toasterId: "note-container",
				});
			},
			7500,
			{ trailing: false },
		),
	);

	const handleManualScrolling = () => {
		const paused = (playerRef.current as HTMLVideoElement).paused;
		const checked = (
			document.getElementById("autoscroll-checkbox") as HTMLInputElement
		).checked;
		if (checked && !paused) {
			toastWheel.current();
			handleTempDisableAutoscroll();
		}
	};

	// keydown only fires on the focused element div
	// plain, non-focusable div and would never receive it)
	// skip clicks/keys that originate from interactive or editable descendants
	// (note card buttons/inputs, the Tiptap editor) so this container-level
	// handling doesn't steal focus or hijack arrow-key cursor movement there
	const isInteractiveOrEditableTarget = (target: EventTarget | null) => {
		return (target as HTMLElement)?.closest?.(
			"input, textarea, button, a, select, [contenteditable='true']",
		);
	};
	const handleFocusContainer = (event: MouseEvent) => {
		if (isInteractiveOrEditableTarget(event.target)) return;
		(event.target as HTMLDivElement).focus();
	};

	const handleArrowKeyScroll = (event: KeyboardEvent) => {
		if (isInteractiveOrEditableTarget(event.target)) return;
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			handleManualScrolling();
		}
	};

	useEffect(() => {
		const virtualDiv = document.getElementById("virtual-container");

		virtualDiv?.addEventListener("wheel", handleManualScrolling);
		virtualDiv?.addEventListener("click", handleFocusContainer);
		virtualDiv?.addEventListener("keydown", handleArrowKeyScroll);
		return () => {
			virtualDiv?.removeEventListener("wheel", handleManualScrolling);
			virtualDiv?.removeEventListener("click", handleFocusContainer);
			virtualDiv?.removeEventListener("keydown", handleArrowKeyScroll);
		};
		// virtual-container event listener only mounts/unmounts on the empty <-> non-empty
	}, [noteCount > 0]);

	///////////////////////////////// component /////////////////////////////////
	return (
		<div
			ref={scrollRef}
			className="flex flex-col border-l-2 items-center flex-1 min-w-0 h-dvh overflow-auto"
			style={{ height: "98dvh" }}
		>
			<Toaster toasterId="note-container" />
			{/* current note position + Notes count + Add note collapsible (by daisy UI) */}
			<div className="sticky top-0 grow-0 w-full min-w-0 bg-accent rounded-t-lg z-10 px-1">
				<div className="flex flex-col py-2 gap-2">
					<div className="flex flex-row gap-2 justify-evenly">
						<button
							title="click to jump to current note"
							className="btn btn-sm btn-info ml-1 font-bold"
							onClick={_.throttle(autoScrollToCurrIdx, 300)}
						>
							{activeIndex + 1}/{noteCount} Notes
						</button>
						<div
							className="input input-sm"
							title="Search Notes, results ranked by relevance"
						>
							<Search className="h-[1em]" />
							<input
								id="search-note-q"
								type="search"
								placeholder="Search Notes, results ranked by relevance"
								onChange={(e) => handleSearchNote.current(e.target.value)}
							/>
						</div>
						<div className="flex flex-row gap-1">
							<label className="label text-sm text-info-content">
								Auto-follow
							</label>
							<input
								id="autoscroll-checkbox"
								type="checkbox"
								defaultChecked
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
						// make this div focusable, reference:
						// https://stackoverflow.com/questions/3656467/is-it-possible-to-focus-on-a-div-using-javascript-focus-function
						tabIndex={0}
					>
						{virtualItems.map((vItem) => {
							const note = searchedNoteList[vItem.index];
							return (
								<div
									key={note.noteId}
									data-index={vItem.index}
									ref={virtualizer.measureElement}
									className={`${vItem.index === activeIndex && note.startTime <= throttledPlayTime && note.endTime >= throttledPlayTime && "aura aura-xl aura-holo"}  w-full max-w-full mb-4`}
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
						<p>No notes related to this video/search query</p>
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
