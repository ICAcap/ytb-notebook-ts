import { JSONContent } from "@tiptap/react";
import { renderToHTMLString } from "@tiptap/static-renderer";
import { TiptapExtensions } from "@/_components/RichTextEditor/TiptapExtension";
import puppeteer from "puppeteer";
import { Note } from "../../../../../../generated/prisma";
import { formatTimeStamp } from "../../../../../../utils/formatTimeStamp";

// reference: https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/

function generateNoteHTMLStr(note: Note): string {
	const noteHtml = renderToHTMLString({
		content: note.content as JSONContent,
		extensions: TiptapExtensions,
	});
	const startTime = formatTimeStamp(note.startTime);
	const endTime =
		note.startTime === note.endTime ? "" : formatTimeStamp(note.endTime);
	const timeStampText = endTime ? `${startTime} - ${endTime}` : startTime;
	const timeStampSpan = `<span style="display: block; text-align: center; font-weight: bold;">${timeStampText}</span><hr/>`;
	const noteHTMLStr = `<div style="padding: 20px; box-sizing: border-box;">${timeStampSpan}${noteHtml}</div>`;

	return noteHTMLStr;
}

export async function printPDF(notes: Note[]) {
	const notesHtmlArr = notes.map((note) => generateNoteHTMLStr(note));

	// puppeteer generate pdf on chrome
	const browser = await puppeteer.launch({ headless: true });
	try {
		const page = await browser.newPage();
		await page.setContent(notesHtmlArr.join("<br/>"), { waitUntil: "load" });
		const pdf = await page.pdf({
			printBackground: true,
			scale: 1,
		});
		return pdf; // return the pdf buffer
	} finally {
		await browser.close(); // turn off
	}
}
