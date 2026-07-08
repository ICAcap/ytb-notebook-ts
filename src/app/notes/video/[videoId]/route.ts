// reference: https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/
import requireSession from "../../../../../lib/requireSession";
import { getNotesByVideo } from "../../../../../lib/dbTableAction/noteTableAction";
import { getVideoById } from "../../../../../lib/dbTableAction/videoTableAction";
import { notFound } from "next/navigation";
import { printPDF } from "./puppetVideoPDF";

// puppeteer GET api endpoint

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ videoId: string }> },
) {
	const session = await requireSession();
	const userId = session.user.id;
	const videoId = (await params).videoId;

	const video = await getVideoById(userId, videoId);
	const notes = await getNotesByVideo(userId, videoId);

	if (!video || !notes || notes.length === 0) {
		notFound();
	}

	// call puppeteer method
	const pdf = await printPDF(notes, video.title);

	// browser response to trigger download modal
	return new Response(
		new Blob([pdf as unknown as BlobPart], { type: "application/pdf" }),
		{
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="VideoNotes-${videoId}-${Date.now()}.pdf"`,
				"Content-Length": String(pdf.length),
			},
		},
	);
}
