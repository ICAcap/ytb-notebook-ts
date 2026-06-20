import TextEditor from "../../_components/RichTextEditor/TextEditor";
import Sidebar from "@/_components/sidebar";

const sampleJson = {
	type: "doc",
	content: [
		{
			type: "heading",
			attrs: { level: 1, textAlign: "left" },
			content: [{ type: "text", text: "Tiptap JSON Restore Test" }],
		},
		{
			type: "paragraph",
			attrs: { textAlign: "left" },
			content: [
				{ type: "text", text: "This content was " },
				{ type: "text", marks: [{ type: "bold" }], text: "restored from JSON" },
				{ type: "text", text: "." },
			],
		},
		{
			type: "codeBlock",
			attrs: { language: "typescript" },
			content: [{ type: "text", text: "const x: number = 42;" }],
		},
	],
};

const page = () => {
	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<main className="flex-1 p-6">
				<TextEditor contentJson={sampleJson} />
			</main>
		</div>
	);
};

export default page;
