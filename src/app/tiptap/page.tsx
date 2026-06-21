import Sidebar from "@/_components/sidebar";
import NoteCard from "../videos/_components/NoteCard";

export const sampleJson = {
	type: "doc",
	content: [
		{
			type: "heading",
			attrs: { level: 1, textAlign: "left" },
			content: [{ type: "text", text: "Rich Text Features" }],
		},
		{
			type: "paragraph",
			attrs: { textAlign: "left" },
			content: [
				{ type: "text", text: "Text with " },
				{ type: "text", marks: [{ type: "bold" }], text: "bold" },
				{ type: "text", text: ", " },
				{ type: "text", marks: [{ type: "italic" }], text: "italic" },
				{ type: "text", text: ", " },
				{ type: "text", marks: [{ type: "code" }], text: "inline code" },
				{ type: "text", text: ", and " },
				{
					type: "text",
					marks: [{ type: "link", attrs: { href: "https://example.com" } }],
					text: "links",
				},
				{ type: "text", text: "." },
			],
		},
		{
			type: "heading",
			attrs: { level: 2, textAlign: "center" },
			content: [{ type: "text", text: "Center Aligned" }],
		},
		{
			type: "bulletList",
			content: [
				{
					type: "listItem",
					content: [
						{
							type: "paragraph",
							attrs: { textAlign: "left" },
							content: [{ type: "text", text: "Bullet point 1" }],
						},
					],
				},
				{
					type: "listItem",
					content: [
						{
							type: "paragraph",
							attrs: { textAlign: "left" },
							content: [{ type: "text", text: "Bullet point 2" }],
						},
					],
				},
			],
		},
		{
			type: "blockquote",
			content: [
				{
					type: "paragraph",
					attrs: { textAlign: "left" },
					content: [
						{ type: "text", text: "A quote to highlight important info" },
					],
				},
			],
		},
		{
			type: "codeBlock",
			attrs: { language: "typescript" },
			content: [
				{ type: "text", text: "const x: number = 42;\nconsole.log(x);" },
			],
		},
		{
			type: "horizontalRule",
		},
		{
			type: "heading",
			attrs: { level: 3, textAlign: "left" },
			content: [{ type: "text", text: "Color & Highlight" }],
		},
		{
			type: "paragraph",
			attrs: { textAlign: "left" },
			content: [
				{
					type: "text",
					marks: [{ type: "highlight", attrs: { color: "#fbbf24" } }],
					text: "Highlighted text",
				},
				{ type: "text", text: " and " },
				{
					type: "text",
					marks: [{ type: "textStyle", attrs: { color: "#ef4444" } }],
					text: "colored text",
				},
				{ type: "text", text: "." },
			],
		},
	],
};

const page = () => {
	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<main className="flex-1 p-6">
				<NoteCard
					content={sampleJson}
					noteId={"1"}
					userId={"1"}
					videoId={"1"}
					startTime={0}
					endTime={80}
					color={"#FF0000"}
					screenshotUrl={null}
					createdAt={new Date("2023-05-12T10:30:00Z")} // Mock date for initial creation.
					updatedAt={new Date("2023-06-20T15:45:00Z")} // Mock date for last modification.
				/>
			</main>
		</div>
	);
};

export default page;
