"use client";

import TextEditor from "@/_components/RichTextEditor/TextEditor";
import { Note } from "../../../../generated/prisma";
import { useState } from "react";
import { PencilLine } from "lucide-react";
import { JSONContent } from "@tiptap/react";
import { formatTimeStamp } from "../../../../utils/formatTimeStamp";

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
		return;
	}

	function handleCancel() {
		setEditable(false);
	}
	return (
		<div>
			<h1>NoteCard</h1>
			<TextEditor contentJson={contentJson} />
		</div>
	);
};
