import requireSession from "../../../lib/requireSession";
import TextEditor from "../../../components/RichTextEditor/TextEditor";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Tiptap",
	description: "This is a test page",
};

export default async function SettingPage() {
	await requireSession();

	return (
		<div>
			<main>
				<TextEditor />
			</main>
		</div>
	);
}
