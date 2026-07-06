"use client";

import { useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvasPro from "html2canvas-pro";
import { generateHTML, JSONContent } from "@tiptap/react";
import { TiptapExtensions } from "@/_components/RichTextEditor/TiptapExtension";
import { Note } from "../../../../../generated/prisma";
import { formatTimeStamp } from "../../../../../utils/formatTimeStamp";

declare global {
	interface Window {
		html2canvas?: typeof html2canvasPro;
	}
}

// reference: https://www.nutrient.io/blog/how-to-convert-html-to-pdf-using-react/
export default function NotePdfExporter({ note }: { note: Note }) {
	const triggered = useRef(false);

	useEffect(() => {
		if (triggered.current) return;
		triggered.current = true; // Prevent duplicate PDFs during React StrictMode double-mount.

		window.html2canvas = html2canvasPro; // Required by jsPDF.html() for canvas rendering.
		const noteHtml = generateHTML(
			note.content as JSONContent,
			TiptapExtensions,
		);

		const startTime = formatTimeStamp(note.startTime);
		const endTime =
			note.startTime === note.endTime ? "" : formatTimeStamp(note.endTime);
		const timeStampText = endTime ? `${startTime} - ${endTime}` : startTime;
		const timeStampSpan = `<span style="display: block; text-align: center; font-weight: bold;">${timeStampText}</span><hr>`;
		const pageHtml = `<div style="padding: 20px; box-sizing: border-box;">${timeStampSpan}${noteHtml}</div>`;

		const doc = new jsPDF({
			orientation: "landscape",
			format: "a3",
			unit: "px",
		});

		const pageWidth = doc.internal.pageSize.getWidth();

		doc.html(pageHtml, {
			width: pageWidth,
			windowWidth: pageWidth,
			autoPaging: "text",
			callback(doc) {
				doc.save(`Note-${note.noteId}-${Date.now()}`);
				window.close(); // Close the tab immediately after download to clean up the export window.
			},
		});
	}, [note]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<p>Generating PDF…</p>
		</div>
	);
}
