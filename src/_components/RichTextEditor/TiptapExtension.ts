import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Heading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { createLowlight, all } from "lowlight";

const lowlight = createLowlight(all); // create a lowlight instance with all prog languages loaded

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
	}),
	TextStyle,
	Color,
];
