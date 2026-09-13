import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Heading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";

import StarterKit from "@tiptap/starter-kit";
import { createLowlight, all } from "lowlight";
import { CharacterCount, Placeholder } from "@tiptap/extensions";

/**
 * Base Tiptap extensions — safe to import anywhere, including server code
 * (e.g. lib/puppeteerBrowser.ts's static PDF renderer). Does not include the
 * interactive code-block language dropdown, which requires @tiptap/react's
 * ReactNodeViewRenderer; that lives in TiptapExtension.client.ts and is only
 * used by the actual editor (TextEditor.tsx), since a NodeView never fires
 * during static/read-only rendering anyway.
 */

export const lowlight = createLowlight(all); // create a lowlight instance with all prog languages loaded
export const limit = 2000;

export const TiptapExtensions = [
	StarterKit.configure({
		codeBlock: false,
		heading: false,
	}),
	Highlight,
	TextAlign.configure({
		types: ["heading", "paragraph"],
	}),
	Heading,
	CodeBlockLowlight.configure({
		lowlight,
		enableTabIndentation: true,
		defaultLanguage: "js",
	}),
	TextStyle,
	Color,
	CharacterCount.configure({ limit }),
	Placeholder.configure({
		placeholder: "Please avoid inputting sensitive information …",
	}),
];
