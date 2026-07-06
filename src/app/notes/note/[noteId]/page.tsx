import requireSession from "../../../../../lib/requireSession";
import { getNoteById } from "../../../../../lib/dbTableAction/noteTableAction";
import { notFound } from "next/navigation";
import NotePdfExporter from "./NotePdfExporter";

// reference: https://www.nutrient.io/blog/how-to-convert-html-to-pdf-using-react/
async function NotePdfPage({
	params,
}: {
	params: Promise<{ noteId: string }>;
}) {
	const session = await requireSession();
	const userId = session.user.id;
	const noteId = (await params).noteId;

	const note = await getNoteById(userId, noteId);

	if (!note) {
		notFound();
	}

	return <NotePdfExporter note={note} />;
}

export default NotePdfPage;
