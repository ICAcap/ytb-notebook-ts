"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import FloatingMenu from "@tiptap/extension-floating-menu";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { useTheme } from "next-themes";
import MenuBar from "./MenuBar";

const TextEditor = () => {
	// current theme
	const currentStyle = useTheme().theme ?? "light";

	// Define styles based on the active theme
	const themeStyles = {
		light: "bg-slate-300 text-slate-900",
		dark: "bg-slate-500 text-slate-100",
	};

	// editor config
	const editor = useEditor({
		extensions: [
			StarterKit,
			FloatingMenu,
			FloatingMenu,
			Highlight,
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
		],
		immediatelyRender: false,
	});

	return (
		<>
			<style>{`.ProseMirror:focus { outline: none; border: none; }`}</style>
			<div>
				{/* static toolbar - TBD*/}
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
