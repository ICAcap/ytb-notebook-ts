// reference: https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/
import requireSession from "../../../../../../../lib/requireSession";
import { getNotesByVideo } from "../../../../../../../lib/dbTableAction/noteTableAction";
import { getVideoById } from "../../../../../../../lib/dbTableAction/videoTableAction";
import { printNotesToPDF } from "../../../../../../../lib/puppeteerBrowser";

// puppeteer GET api endpoint

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ videoId: string }> },
) {
	const session = await requireSession();
	const userId = session.user.id;
	const videoId = (await params).videoId;

	const video = await getVideoById(userId, videoId);
	if (!video) {
		return new Response("Video Not Existing", { status: 404 });
	}

	const notes = await getNotesByVideo(userId, videoId);

	if (!notes || notes.length === 0) {
		return new Response("No Notes Found", { status: 404 });
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
