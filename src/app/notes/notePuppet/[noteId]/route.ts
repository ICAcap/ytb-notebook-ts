// reference: https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/
import requireSession from "../../../../../lib/requireSession";
import { getNoteById } from "../../../../../lib/dbTableAction/noteTableAction";
import { notFound } from "next/navigation";
import { printPDF } from "./PuppeteerExport";

// puppeteer GET api endpoint

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ noteId: string }> },
) {
	const session = await requireSession();
	const userId = session.user.id;
	if (!userId) {
		notFound();
	}

	const noteId = (await params).noteId;

	const note = await getNoteById(userId, noteId);

	if (!note) {
		notFound();
	}

	// call puppeteer method
	const pdf = await printPDF(note);

	// browser response to download
	return new Response(
		new Blob([pdf as unknown as BlobPart], { type: "application/pdf" }),
		{
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="Note-${note.noteId}-${Date.now()}.pdf"`,
				"Content-Length": String(pdf.length),
			},
		},
	);
}
