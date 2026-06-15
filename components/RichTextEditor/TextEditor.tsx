"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import FloatingMenu from "@tiptap/extension-floating-menu";
import { useTheme } from "next-themes";

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
		extensions: [StarterKit, FloatingMenu],
		immediatelyRender: false,
	});

	return (
		<div>
			<span>
				<h1 className="text-xl">TextEditor</h1>
			</span>
			{/* static toolbar - TBD*/}
			<EditorContent
				editor={editor}
				className={`min-h-15 border rounded-md ${currentStyle === "light" ? themeStyles.light : themeStyles.dark}`}
			/>
		</div>
	);
};

export default TextEditor;
