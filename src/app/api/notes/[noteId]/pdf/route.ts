// reference: https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/
import requireSession from "../../../../../../lib/requireSession";
import { getNoteById } from "../../../../../../lib/dbTableAction/noteTableAction";
import { printNotesToPDF } from "../../../../../../utils/puppeteerBrowser";

// puppeteer GET api endpoint

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ noteId: string }> },
) {
	const session = await requireSession();
	const userId = session.user.id;
	const noteId = (await params).noteId;

	const note = await getNoteById(userId, noteId);

	if (!note) {
		return new Response("This Note No Longer Exists", { status: 404 });
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
