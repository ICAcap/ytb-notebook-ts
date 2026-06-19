import TextEditor from "../../_components/RichTextEditor/TextEditor";

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
		<div>
			<TextEditor contentJson={sampleJson} />
		</div>
	);
};

export default page;
