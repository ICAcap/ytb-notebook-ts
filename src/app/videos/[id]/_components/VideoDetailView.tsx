"use client";

import { useRef, useState, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import NoteContainer from "./NoteContainer";
import { Download } from "lucide-react";
import { VideoDetailType } from "../../../../../lib/dbTableAction/videoTableAction";
import { Note } from "../../../../../generated/prisma";
import CollectionBadgeList from "../../_components/CollectionBadgeList";
import { Group, Panel, Separator, usePanelRef } from "react-resizable-panels";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
const _ = require("lodash"); // for throttle purpose
const VideoDetailView = ({
	userId,
	video,
	notes,
}: {
	userId: string;
	video: VideoDetailType;
	notes: Note[] | null;
}) => {
	// hooks
	const isDemoRoute = usePathname().startsWith("/demo");
	// ref to bridge the player and the notes container to enable timestamp seeking
	const playerRef = useRef<HTMLVideoElement | null>(null);

	// check if window is portrait or vertical
	const [isPortrait, setIsPortrait] = useState<boolean>(false);
	useEffect(() => {
		function checkPortrait() {
			// Source - https://stackoverflow.com/a/16567475
			// Posted by crmpicco, modified by community. See post 'Timeline' for change history
			// Retrieved 2026-09-22, License - CC BY-SA 3.0

			if (window.matchMedia("(orientation: portrait)").matches) {
				// you're in PORTRAIT mode
				setIsPortrait(true);
			}

			if (window.matchMedia("(orientation: landscape)").matches) {
				// you're in LANDSCAPE mode
				setIsPortrait(false);
			}
		}

		checkPortrait(); //init
		addEventListener("resize", checkPortrait); //event listener
		return () => removeEventListener("resize", checkPortrait); //cleanup
	}, []);

	// resize the video panel whenever the orientation flips, so in portrait
	// (e.g. phones) the notes panel gets more than the leftover 35% of the height
	const videoPanelRef = usePanelRef();
	useEffect(() => {
		videoPanelRef.current?.resize(isPortrait ? "45%" : "65%");
	}, [isPortrait]);

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
		<div className="relative flex-1 min-h-0 flex flex-col">
			{/* resizable group panels - fixed height so each panel scrolls on its own */}
			<Group
				className="flex-1 min-h-0 gap-2 mt-1"
				orientation={isPortrait ? "vertical" : "horizontal"}
			>
				<Panel
					panelRef={videoPanelRef}
					defaultSize="65%"
					maxSize="80%"
					minSize="20%"
				>
					<Toaster />
					<div className="flex flex-col w-full h-full gap-1 overflow-y-auto">
						<VideoPlayer
							videoId={video.videoId}
							userId={userId}
							url={`https://www.youtube.com/watch?v=${video.youtubeVidID}`}
							playerRef={playerRef}
							lastPlayedTime={video.lastPlayedTime}
							onTimeUpdate={throttledSetPlayTime}
						/>
						<div className="flex mt-2 pl-2">
							<h1 className="text-wrap wrap-break-word text-base sm:text-xl font-semibold">
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
						<span
							title={
								isDemoRoute
									? "Note Exportation Disabled in Demo"
									: "Export All Notes"
							}
							className="max-w-xl lg:max-w-md mx-auto my-2"
						>
							<button
								disabled={noteList.length === 0 || isDemoRoute}
								type="button"
								className="btn btn-md sm:btn-lg btn-primary w-full"
								onClick={() =>
									window.open(`/api/notes/video/${video.videoId}/pdf`, "_blank")
								}
								rel="noopener noreferrer"
							>
								<Download className="w-5 h-5" />
								Export All Notes
							</button>
						</span>
					</div>
				</Panel>
				<Separator
					className={
						isPortrait
							? "h-3 border-y-4 border-double border-base-content hover:bg-base-200 hover:border-base-content/150 cursor-row-resize transition-colors"
							: "w-2 border-x-4 border-double border-base-content hover:bg-base-200 hover:border-base-content/150 cursor-col-resize transition-colors"
					}
				/>
				<Panel>
					<NoteContainer
						userId={userId}
						videoId={video.videoId}
						noteList={noteList}
						setNoteList={setNoteList}
						playerRef={playerRef}
						throttledPlayTime={throttledPlayTime}
					/>
				</Panel>
			</Group>
		</div>
	);
};

export default VideoDetailView;
