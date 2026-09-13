import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockComponent from "./CodeBlockComponent";
import { TiptapExtensions, lowlight } from "./TiptapExtension";

/**
 * Client-only extensions for the live editor (TextEditor.tsx). Adds the
 * interactive code-block language dropdown via a React NodeView. Kept
 * separate from TiptapExtension.ts so server code (e.g. the PDF renderer in
 * lib/puppeteerBrowser.ts) never imports @tiptap/react.
 *
 * reference: https://tiptap.dev/docs/examples/advanced/syntax-highlighting#page-title
 */

const CodeBlockWithLanguagePicker = CodeBlockLowlight.extend({
	addNodeView() {
		return ReactNodeViewRenderer(CodeBlockComponent);
	},
}).configure({
	lowlight,
	enableTabIndentation: true,
	defaultLanguage: "js",
});

export const TiptapEditorExtensions = TiptapExtensions.filter(
	(ext) => ext.name !== "codeBlock",
).concat(CodeBlockWithLanguagePicker);
