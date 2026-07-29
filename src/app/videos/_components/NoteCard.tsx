"use client";

import { Note } from "../../../../generated/prisma";
import { memo, useState } from "react";
import { AlertCircle, PencilLine, Shredder, Download } from "lucide-react";
import { JSONContent } from "@tiptap/react";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { formatTimeStamp } from "../../../../utils/formatTimeStamp";
import { TiptapExtensions } from "@/_components/RichTextEditor/TiptapExtension";
import EditableNoteForm from "./EditableNoteForm";
import { deleteNote } from "../../../../lib/dbTableAction/noteTableAction";
import Modal from "@/_components/ModalSkeleton";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";
import "@/_components/RichTextEditor/styles.scss";

type Props = Omit<Note, "contentText" | "createdAt"> & {
	playerRef?: React.RefObject<HTMLVideoElement | null>; // DOM ref to connect to react player
	onDeleted?: (noteId: string) => void; // parent component's handler func when a note is deleted
	onUpdated?: (note: Note) => void; // parent component's handler func when a note is updated (upserted)
	onOpenEdit?: () => void;
};

const NoteCard = (props: Props) => {
	// get related data
	const contentJson = props.content as JSONContent;
	const starTimeStamp = formatTimeStamp(props.startTime);
	const endTimeStamp = formatTimeStamp(props.endTime);
	const color = props.color;
	const updatedAtLabel = props.updatedAt.toLocaleString("en-US", {
		month: "2-digit",
		day: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	// hooks
	const isDemoRoute = usePathname().startsWith("/demo");
	const [editable, setEditable] = useState(false);
	const [trashModalOpen, setTrashModalOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// helper func
	function handleTimeBadgeSeekTo(seconds: number) {
		if (props.playerRef?.current) {
			props.playerRef.current.currentTime = Math.max(
				0,
				Math.min(props.playerRef.current.duration, seconds),
			);
			props.playerRef.current.play();
		}
		return;
	}

	const handleDeleteNote = async () => {
		setIsDeleting(true);
		const deletion = await deleteNote(props.userId, props.noteId);

		if (deletion) {
			props.onDeleted?.(props.noteId); //pass up success deletion signal to parent component to trigger re-rendering
			toast.success(
				`Note last updated at "${updatedAtLabel}" deleted successfully!`,
				{
					id: "note-deletion-success",
				},
			);
			setIsDeleting(false);
			setTrashModalOpen(false);
		} else {
			toast.error(
				`Failed to delete the note last updated at "${updatedAtLabel}". Please try again.`,
				{
					id: "note-deletion-failed",
				},
			);
			setIsDeleting(false);
		}
	};

	return (
		<div
			className="card rounded-lg w-full"
			style={{ boxShadow: `0 4px 8px ${color}80` }}
		>
			<div
				className="card-title rounded-t-lg flex gap-2 justify-end"
				style={{ backgroundColor: color }}
			>
				<div className="flex gap-2">
					<span
						title={
							isDemoRoute
								? "Note Exportation Disabled in Demo"
								: "Export This Note"
						}
					>
						<button
							disabled={editable || isDemoRoute}
							className="btn btn-square btn-ghost btn-md"
							onClick={() => {
								window.open(`/api/notes/${props.noteId}/pdf`, "_blank");
							}}
							rel="noopener noreferrer"
						>
							<Download className="w-6 h-6" color="white" />
						</button>
					</span>
					<span
						title={
							isDemoRoute ? "Note Edition Disabled in Demo" : "Edit This Note"
						}
					>
						<button
							disabled={editable || isDemoRoute}
							onClick={() => {
								setEditable(true);
								props.onOpenEdit?.();
							}}
							className="btn btn-square btn-ghost btn-md"
						>
							<PencilLine className="w-6 h-6" color="white" />
						</button>
					</span>

					<button
						title="delete this note"
						className="btn btn-square btn-ghost btn-md"
						onClick={() => {
							props.playerRef?.current && props.playerRef.current.pause(); // pause vid
							setTrashModalOpen(true);
						}}
					>
						<Shredder className="w-6 h-6" color="white" />
					</button>
				</div>
			</div>
			<div className="border-b border-accent px-4 py-2">
				<div className="flex gap-2 items-center justify-between">
					<span
						className="text-xs text-base-content/60 truncate"
						title={updatedAtLabel}
					>
						updated {updatedAtLabel}
					</span>
					<div className="flex gap-2 items-center">
						<button
							onClick={() => handleTimeBadgeSeekTo(props.startTime)}
							className="btn btn-xs btn-primary"
						>
							{starTimeStamp}
						</button>
						{props.startTime !== props.endTime && (
							<>
								<span className="text-2xl">➨</span>
								<button
									onClick={() => handleTimeBadgeSeekTo(props.endTime)}
									className="btn btn-xs btn-primary"
								>
									{endTimeStamp}
								</button>
							</>
						)}
					</div>
				</div>
			</div>
			<div className="card-body">
				{editable ? (
					<EditableNoteForm
						key={props.updatedAt.getTime()}
						noteId={props.noteId}
						userId={props.userId}
						videoId={props.videoId}
						startTime={props.startTime}
						endTime={props.endTime}
						content={props.content}
						color={props.color}
						playerRef={props.playerRef}
						setEditable={setEditable}
						onUpdated={props.onUpdated}
					/>
				) : (
					<div className="tiptap prose prose-sm max-w-none wrap-break-word">
						{/* Render static content here - */}
						{/* reference: https://tiptap.dev/docs/editor/api/utilities/static-renderer#generating-react-components-from-json */}
						{renderToReactElement({
							content: contentJson,
							extensions: TiptapExtensions,
						})}
					</div>
				)}
			</div>

			{/* Delete Note Modal */}
			<Modal
				isOpen={trashModalOpen}
				onClose={() => {
					setTrashModalOpen(false);
				}}
			>
				<div role="dialog" className="flex flex-col gap-6">
					<div className="flex items-center gap-3">
						<AlertCircle size={40} className="text-error shrink-0" />
						<span className="text-lg font-semibold">Confirm Note Deletion</span>
					</div>
					<p>Last Updated at {updatedAtLabel}</p>
					<div className="flex gap-3 justify-between">
						<button
							onClick={() => {
								setTrashModalOpen(false);
							}}
							className="btn btn-outline flex-1"
						>
							Cancel
						</button>
						<button
							onClick={handleDeleteNote}
							disabled={isDeleting}
							className="btn btn-error flex-1"
						>
							{isDeleting ? (
								<>
									<span className="loading loading-spinner loading-sm"></span>
									Deleting...
								</>
							) : (
								"Delete"
							)}
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default memo(NoteCard);
