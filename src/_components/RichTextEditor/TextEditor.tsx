"use client";

import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import { useTheme } from "next-themes";
import MenuBar from "./MenuBar";
import { TiptapExtensions } from "./TiptapExtension";

const TextEditor = ({ contentJson }: { contentJson?: JSONContent }) => {
	// current theme
	const currentStyle = useTheme().theme ?? "light";

	// editor-exclusive styles based on the active theme
	const themeStyles = {
		light: "bg-white text-slate-900",
		dark: "bg-slate-500 text-slate-100",
	};

	// editor config
	const editor = useEditor({
		extensions: TiptapExtensions,
		content: contentJson ?? {},
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
