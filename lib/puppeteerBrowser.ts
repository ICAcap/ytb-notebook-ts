// reference: https://mofadlalla.io/2025/08/21/the-ultimate-guide-to-generating-pdfs-from-html-with-nodejs-and-puppeteer-2292.html
import puppeteer, { Page } from "puppeteer";
import { Browser } from "puppeteer";
import { JSONContent } from "@tiptap/react";
import { renderToHTMLString } from "@tiptap/static-renderer";
import { TiptapExtensions } from "@/_components/RichTextEditor/TiptapExtension";
import { formatTimeStamp } from "../utils/formatTimeStamp";
import { Note } from "../generated/prisma";
import { escapeHtml } from "../utils/escapeHtml";

declare global {
	var __puppeteerBrowserPromise: Promise<Browser> | undefined;
}

/**
 * Returns the shared warm browser instance, launching one if needed.
 * Pinned to globalThis so dev-mode Fast Refresh reuses it instead of orphaning
 * a fresh Chromium process on every route-handler recompile.
 */
export function getBrowser(): Promise<Browser> {
	if (!globalThis.__puppeteerBrowserPromise) {
		globalThis.__puppeteerBrowserPromise = launchBrowser();
	}
	return globalThis.__puppeteerBrowserPromise;
}

async function launchBrowser(): Promise<Browser> {
	console.log("Launching a warm browser instance...");
	try {
		const browser = await puppeteer.launch({
			headless: true,
			// Essential for environments without a GUI or inside Docker containers.
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});

		// If the warm browser crashes or gets killed externally (e.g. via Task
		// Manager), clear the cached promise so the next getBrowser() call
		// relaunches a fresh instance instead of returning a dead browser forever.
		browser.once("disconnected", () => {
			console.warn(
				"⚠️ Puppeteer browser disconnected, will relaunch on next request",
			);
			globalThis.__puppeteerBrowserPromise = undefined;
		});

		console.log("✔️ Puppeteer browser instance launched---");
		return browser;
	} catch (error) {
		// Don't leave a rejected promise cached, or every future getBrowser()
		// call would immediately reject with this same stale error.
		globalThis.__puppeteerBrowserPromise = undefined;
		console.error("❌ Puppeteer browser instance launching failed !!!", error);
		throw error;
	}
}

/// export pdf functions

// reference: https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/

function generateSingleNoteHTMLStr(note: Note): string {
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

export async function printNotesToPDF(notes: Note[], videoTitle?: string) {
	let newPage: Page | null = null;
	const notesHtmlArr = notes.map((note) => generateSingleNoteHTMLStr(note));
	const cleanedVidTitle =
		videoTitle &&
		`<h1 style="text-align: center;">${escapeHtml(videoTitle)}</h1>`;
	const htmlContent = `<div>${cleanedVidTitle}${notesHtmlArr.join("<br/>")}</div>`;

	// puppeteer generate pdf on chrome
	const browserInstance = await getBrowser();
	try {
		newPage = await browserInstance.newPage();
		await newPage.setJavaScriptEnabled(false);
		await newPage.setContent(htmlContent, { waitUntil: "load" });
		const pdf = await newPage.pdf({
			printBackground: true,
			scale: 1,
		});
		return pdf; // return the pdf buffer
	} finally {
		if (newPage) await newPage.close(); // close the page
	}
}
