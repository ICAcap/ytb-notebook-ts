// reference: https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/
import requireSession from "../../../../../../lib/requireSession";
import { getNoteById } from "../../../../../../lib/dbTableAction/noteTableAction";
import { printNotesToPDF } from "../../../../../../lib/puppeteerBrowser";
import { pdfExportRatelimit } from "../../../../../../utils/ratelimiter";
// puppeteer GET api endpoint

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ noteId: string }> },
) {
	const session = await requireSession();
	const userId = session.user.id;

	const { success } = await pdfExportRatelimit.limit(userId);

	if (!success) {
		// return 429 response if rate limit exceeded
		return new Response(
			"<!DOCTYPE html><title>429 Too Many Requests</title><h1>Too Many Requests, Please Avoid Spamming PDF Export</h1></p>",
			{
				status: 429,
				headers: { "Content-Type": "text/html; charset=utf-8" },
			},
		);
	}

	const noteId = (await params).noteId;

	const note = await getNoteById(userId, noteId);

	if (!note) {
		return new Response(
			"<!DOCTYPE html><title>404 Not Found</title><h1>This Note No Longer Exists</h1>",
			{
				status: 404,
				headers: { "Content-Type": "text/html; charset=utf-8" },
			},
		);
	}

	// call puppeteer method
	const pdf = await printNotesToPDF([note], "");

	// browser response to trigger download modal
	return new Response(
		new Blob([pdf as unknown as BlobPart], { type: "application/pdf" }),
		{
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `inline; filename="Note-${note.noteId}-${Date.now()}.pdf"`,
				"Content-Length": String(pdf.length),
			},
		},
	);
}
