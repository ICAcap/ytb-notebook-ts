import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Heading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { createLowlight, all } from "lowlight";
import { CharacterCount, Placeholder } from "@tiptap/extensions";

/**
 * Tiptap extensions config here
 */

const lowlight = createLowlight(all); // create a lowlight instance with all prog languages loaded
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
		defaultLanguage: "typescript",
	}),
	TextStyle,
	Color,
	CharacterCount.configure({ limit }),
	Placeholder.configure({
		placeholder: "Please avoid inputting sensitive information …",
	}),
];
