"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Heading from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import { useTheme } from "next-themes";
import MenuBar from "./MenuBar";

const TextEditor = ({ contentJson }: { contentJson?: object }) => {
	// current theme
	const currentStyle = useTheme().theme ?? "light";

	// editor-exclusive styles based on the active theme
	const themeStyles = {
		light: "bg-amber-300 text-slate-900",
		dark: "bg-slate-500 text-slate-100",
	};

	const lowlight = createLowlight(all); // create a lowlight instance with all prog languages loaded

	// editor config
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				codeBlock: false,
			}),
			Highlight,
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Heading,
			CodeBlockLowlight.configure({
				lowlight,
			}),
		],
		content: contentJson ?? "",
		immediatelyRender: false,
	});

	return (
		<>
			<style>{`.ProseMirror:focus { outline: none; border: none; }`}</style>
			<div>
				{/* static menu tool bar */}
				<MenuBar editor={editor} />
				<EditorContent
					editor={editor}
					className={`border m-2 p-2 min-h-15 rounded-md ${currentStyle === "light" ? themeStyles.light : themeStyles.dark}`}
				/>
			</div>
		</>
	);
};

export default TextEditor;
