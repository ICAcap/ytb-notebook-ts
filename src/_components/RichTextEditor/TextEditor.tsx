"use client";

import { useEffect } from "react";
import {
	useEditor,
	useEditorState,
	EditorContent,
	JSONContent,
} from "@tiptap/react";
import { useTheme } from "next-themes";
import MenuBar from "./MenuBar";
import { TiptapExtensions, limit } from "./TiptapExtension";

// main component
const TextEditor = ({
	contentJson,
	onChange, // content change handler from parent component
}: {
	contentJson?: JSONContent;
	onChange?: (json: JSONContent) => void;
}) => {
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
		content: contentJson,
		immediatelyRender: false,
		onUpdate: ({ editor }) => {
			onChange?.(editor.getJSON());
		},
	});

	// reference: https://tiptap.dev/docs/editor/extensions/functionality/character-count
	const { charactersCount = 0, wordsCount = 0 } =
		useEditorState({
			editor,
			selector: (context): { charactersCount: number; wordsCount: number } => ({
				charactersCount:
					context.editor?.storage.characterCount.characters() ?? 0,
				wordsCount: context.editor?.storage.characterCount.words() ?? 0,
			}),
		}) ?? {};

	useEffect(() => {
		if (editor) {
			editor.commands.focus("start");
		}
	}, [editor]); // auto focus on the editor when it renders

	return (
		<>
			<style>{`.ProseMirror:focus { outline: none; border: none; }`}</style>
			<div className="w-full max-w-full">
				{/* static menu tool bar */}
				<MenuBar editor={editor} />
				{/* editor */}
				<EditorContent
					editor={editor}
					className={`border m-2 p-2 min-h-10 rounded-md max-w-xl ${currentStyle === "light" ? themeStyles.light : themeStyles.dark}`}
					suppressHydrationWarning
				/>
				{/* word count */}
				<div
					className={`character-count ${charactersCount === limit ? "character-count--warning" : ""}`}
				>
					{charactersCount} / {limit} ({wordsCount} words)
				</div>
				<br />
			</div>
		</>
	);
};

export default TextEditor;
