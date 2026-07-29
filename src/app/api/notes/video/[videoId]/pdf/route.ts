// reference: https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/
import requireSession from "../../../../../../../lib/requireSession";
import { getNotesByVideo } from "../../../../../../../lib/dbTableAction/noteTableAction";
import { getVideoById } from "../../../../../../../lib/dbTableAction/videoTableAction";
import { printNotesToPDF } from "../../../../../../../lib/puppeteerBrowser";
import { pdfExportRatelimit } from "../../../../../../../utils/ratelimiter";
// puppeteer GET api endpoint

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ videoId: string }> },
) {
	const session = await requireSession();
	const userId = session.user.id;

	if (session.user.isAnonymous) {
		return new Response(
			"<!DOCTYPE html><title>403 Forbidden</title><h1>PDF Export Is Not Available In The Demo</h1>",
			{
				status: 403,
				headers: { "Content-Type": "text/html; charset=utf-8" },
			},
		);
	}

	const { success } = await pdfExportRatelimit.limit(userId);

	if (!success) {
		return new Response(
			"<!DOCTYPE html><title>429 Too Many Requests</title><p><h1>Too Many Requests, Please Avoid Spamming PDF Export</h1></p>",
			{
				status: 429,
				headers: { "Content-Type": "text/html; charset=utf-8" },
			},
		);
	}

	const videoId = (await params).videoId;

	const video = await getVideoById(userId, videoId);
	if (!video) {
		return new Response(
			"<!DOCTYPE html><title>404 Not Found</title><h1>Video Not Existing</h1>",
			{
				status: 404,
				headers: { "Content-Type": "text/html; charset=utf-8" },
			},
		);
	}

	const notes = await getNotesByVideo(userId, videoId);

	if (!notes || notes.length === 0) {
		return new Response(
			"<!DOCTYPE html><title>404 Not Found</title><h1>No Notes Found</h1>",
			{
				status: 404,
				headers: { "Content-Type": "text/html; charset=utf-8" },
			},
		);
	}

	// call puppeteer method
	const pdf = await printNotesToPDF(notes, video.title);

	// browser response to trigger download modal
	return new Response(
		new Blob([pdf as unknown as BlobPart], { type: "application/pdf" }),
		{
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `inline; filename="VideoNotes-${videoId}-${Date.now()}.pdf"`,
				"Content-Length": String(pdf.length),
			},
		},
	);
}
