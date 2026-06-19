import { createNote, updateNote, deleteNote } from "./noteTableAction";

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const userId = "80NiPuUDjCKqKX5de08KQxLUIFpwHnzY";
const videoId = "cmq9vdrec0006icu20t8vwszg";

async function run() {
	const created = await createNote({
		userId: userId,
		videoId: videoId,
		startTime: 1,
		endTime: 20,
		content: {
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							text: "hello",
						},
					],
				},
			],
		},
		color: "#FF0000",
	});

	console.log("[x] Note created");
	await sleep(1000);

	const noteId = created?.noteId as string;

	await updateNote({
		userId: userId,
		noteId: noteId,
		startTime: 1,
		endTime: 20,
		content: {
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							text: "hello Hello HELLO!",
						},
					],
				},
			],
		},
		color: "#FFE000",
	});
	console.log("[x] Note updated");
	await sleep(1000);

	await deleteNote(userId, noteId);
	console.log("[x] Note deleted");
}

run();
