import { JSONContent } from "@tiptap/react";
import { renderToHTMLString } from "@tiptap/static-renderer";
import { Note } from "../../../../../generated/prisma";
import { formatTimeStamp } from "../../../../../utils/formatTimeStamp";
import { TiptapExtensions } from "@/_components/RichTextEditor/TiptapExtension";
import puppeteer from "puppeteer";

export async function printPDF(note: Note) {
	const noteHtml = renderToHTMLString({
		content: note.content as JSONContent,
		extensions: TiptapExtensions,
	});

	const startTime = formatTimeStamp(note.startTime);
	const endTime =
		note.startTime === note.endTime ? "" : formatTimeStamp(note.endTime);
	const timeStampText = endTime ? `${startTime} - ${endTime}` : startTime;
	const timeStampSpan = `<span style="display: block; text-align: center; font-weight: bold;">${timeStampText}</span><hr>`;
	const pageHtml = `<div style="padding: 20px; box-sizing: border-box;">${timeStampSpan}${noteHtml}</div>`;

	// puppeteer generate pdf on chrome
	const browser = await puppeteer.launch({ headless: true });
	try {
		const page = await browser.newPage();
		await page.setContent(pageHtml, { waitUntil: "load" });
		const pdf = await page.pdf({
			printBackground: true,
			scale: 1,
		});
		return pdf; // return the pdf buffer
	} finally {
		await browser.close();
	}
}
