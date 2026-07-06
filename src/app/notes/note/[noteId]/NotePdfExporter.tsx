"use client";

import { useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvasPro from "html2canvas-pro";
import { generateHTML, JSONContent } from "@tiptap/react";
import { TiptapExtensions } from "@/_components/RichTextEditor/TiptapExtension";
import { Note } from "../../../../../generated/prisma";

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
		const noteHtmlString = generateHTML(
			note.content as JSONContent,
			TiptapExtensions,
		);

		const noteHtml = new DOMParser().parseFromString(
			noteHtmlString,
			"text/html",
		).body;

		const doc = new jsPDF({
			format: "a4",
			unit: "px",
		});

		doc.html(noteHtml, {
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
