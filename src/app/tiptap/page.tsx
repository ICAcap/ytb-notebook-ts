import requireSession from "../../../lib/requireSession";
import TextEditor from "../../../components/RichTextEditor/TextEditor";

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
