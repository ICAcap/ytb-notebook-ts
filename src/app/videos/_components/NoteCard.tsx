"use client";

import TextEditor from "@/_components/RichTextEditor/TextEditor";
import { Note } from "../../../../generated/prisma";
import { useState } from "react";
import { PencilLine } from "lucide-react";
import { JSONContent } from "@tiptap/react";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { formatTimeStamp } from "../../../../utils/formatTimeStamp";
import { TiptapExtensions } from "@/_components/RichTextEditor/TiptapExtension";
import "@/_components/RichTextEditor/styles.scss";

const NoteCard = (note: Note) => {
	// get related data
	const contentJson = note.content as JSONContent;
	const starTime = formatTimeStamp(note.startTime);
	const endTime = formatTimeStamp(note.endTime);
	const color = note.color;

	// hooks
	const [editable, setEditable] = useState(false);

	// helper func
	function handleEdit() {
		return; // TBD
	}

	function handleCancel() {
		setEditable(false);
	}
	return (
		<div className="p-4 border rounded-md">
			<h1 className="text-lg font-bold">NoteCard</h1>
			{editable ? (
				<TextEditor contentJson={contentJson} />
			) : (
				<div className="card tiptap">
					{/* Render static content here - */}
					{/* reference: https://tiptap.dev/docs/editor/api/utilities/static-renderer#generating-react-components-from-json */}
					{renderToReactElement({
						content: contentJson,
						extensions: TiptapExtensions,
					})}
				</div>
			)}
		</div>
	);
};

export default NoteCard;
