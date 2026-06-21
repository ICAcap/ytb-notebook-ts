"use client";

import TextEditor from "@/_components/RichTextEditor/TextEditor";
import { Note } from "../../../../generated/prisma";
import { useState } from "react";
import { PencilLine, Shredder } from "lucide-react";
import { JSONContent } from "@tiptap/react";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { formatTimeStamp } from "../../../../utils/formatTimeStamp";
import { TiptapExtensions } from "@/_components/RichTextEditor/TiptapExtension";
import "@/_components/RichTextEditor/styles.scss";

type Props = Note & { playerRef?: React.RefObject<HTMLVideoElement | null> };

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
	const [editable, setEditable] = useState(false);
	const [pencilModal, setPencilModalOpen] = useState(false);
	const [trashModal, setTrashModalOpen] = useState(false);

	// helper func
	function handleSeekTo(seconds: number) {
		if (props.playerRef?.current) {
			props.playerRef.current.currentTime = Math.max(
				0,
				Math.min(props.playerRef.current.duration, seconds),
			);
		}
		return;
	}

	function handleEdit() {
		return; // TBD
	}

	function handleCancel() {
		setEditable(false);
	}
	return (
		<div className="card card-md shadow-md shadow-primary rounded-lg">
			<div
				className="card-title rounded-t-lg flex gap-2 justify-end"
				style={{ backgroundColor: color }}
			>
				<div className="flex gap-2">
					<button
						className="btn btn-square btn-ghost btn-md"
						onClick={() => setPencilModalOpen(true)}
					>
						<PencilLine className="w-6 h-6" color="white" />
					</button>
					<button
						className="btn btn-square btn-ghost btn-md"
						onClick={() => setTrashModalOpen(true)}
					>
						<Shredder className="w-6 h-6" color="white" />
					</button>
				</div>
			</div>
			<div className="border-b border-accent px-4 py-2">
				<div className="flex gap-2 items-center justify-between">
					<span className="text-xs text-base-content/60 truncate" title={updatedAtLabel}>
						Updated {updatedAtLabel}
					</span>
					<div className="flex gap-2 items-center">
						<button
							onClick={() => handleSeekTo(props.startTime)}
							className="btn btn-xs btn-primary"
						>
							{starTimeStamp}
						</button>
						{props.startTime !== props.endTime && (
							<>
								<span className="text-2xl">➨</span>
								<button
									onClick={() => handleSeekTo(props.endTime)}
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
					<TextEditor contentJson={contentJson} />
				) : (
					<div className="tiptap">
						{/* Render static content here - */}
						{/* reference: https://tiptap.dev/docs/editor/api/utilities/static-renderer#generating-react-components-from-json */}
						{renderToReactElement({
							content: contentJson,
							extensions: TiptapExtensions,
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default NoteCard;
