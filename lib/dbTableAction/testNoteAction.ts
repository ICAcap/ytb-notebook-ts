import {
	getNotesByVideo,
	createNote,
	updateNote,
	deleteNote,
	getUpcomingNotesInVideo,
	getNotesByColor,
	getNoteCountByVideo,
	getNotesByUser,
	getNoteCountByUser,
} from "./noteTableAction";

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

	created && console.log("[x] Note created");
	await sleep(1000);

	const noteId = created?.noteId as string;

	const updated = await updateNote({
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
	updated && console.log("[x] Note updated");
	await sleep(1000);

	const gotNotes = await getNotesByVideo(userId, videoId);
	gotNotes && console.log("Get the notes -- ", gotNotes);
	await sleep(1000);

	const upcomingNotes = await getUpcomingNotesInVideo(userId, videoId, 0);
	upcomingNotes && console.log("[x] Upcoming notes fetched -- ", upcomingNotes);
	await sleep(1000);

	const coloredNotes = await getNotesByColor(userId, videoId, "#FFE000");
	coloredNotes &&
		console.log("[x] Notes by color (#FFE000) fetched -- ", coloredNotes);
	await sleep(1000);

	const countByVideo = await getNoteCountByVideo(userId, videoId);
	console.log("[x] Note count by video -- ", countByVideo);
	await sleep(1000);

	const notesByUserPage1 = await getNotesByUser(userId, 1, 10);
	console.log("[x] Notes by user (page 1, pageSize 10) -- ", notesByUserPage1);
	await sleep(1000);

	const countByUser = await getNoteCountByUser(userId);
	console.log("[x] Note count by user -- ", countByUser);

	const deleted = await deleteNote(userId, noteId);
	deleted && console.log("[x] Note deleted");

	created && gotNotes && updated && deleted && console.log("DONE");
}

run();
