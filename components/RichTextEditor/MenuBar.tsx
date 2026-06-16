"use client";

import "./styles.scss";
import { Editor, useEditorState } from "@tiptap/react";
import {
	Heading1,
	Heading2,
	Heading3,
	Bold,
	Italic,
	Strikethrough,
	Highlighter,
	AlignLeft,
	AlignCenter,
	AlignRight,
	AlignJustify,
	SquareCode,
} from "lucide-react";

const MenuBar = ({ editor }: { editor: Editor | null }) => {
	//reference: https://tiptap.dev/docs/editor/getting-started/install/react#reacting-to-editor-state-changes
	const editorState = useEditorState({
		editor,
		selector: ({ editor }) => ({
			isBold: editor?.isActive("bold") ?? false,
			isItalic: editor?.isActive("italic") ?? false,
			isStrike: editor?.isActive("strike") ?? false,
			isHighlight: editor?.isActive("highlight") ?? false,
			isH1: editor?.isActive("heading", { level: 1 }) ?? false,
			isH2: editor?.isActive("heading", { level: 2 }) ?? false,
			isH3: editor?.isActive("heading", { level: 3 }) ?? false,
			isAlignLeft: editor?.isActive({ textAlign: "left" }) ?? false,
			isAlignCenter: editor?.isActive({ textAlign: "center" }) ?? false,
			isAlignRight: editor?.isActive({ textAlign: "right" }) ?? false,
			isAlignJustify: editor?.isActive({ textAlign: "justify" }) ?? false,
			isLowLightCode: editor?.isActive("codeBlock") ?? false,
		}),
	})!;

	if (!editor) {
		return null;
	}

	return (
		<div className="control-group">
			<div className="join">
				<button
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
					className={`btn join-item ${editorState.isH1 ? "bg-accent" : ""}`}
					title="Heading 1"
				>
					<Heading1 size={20} strokeWidth={2.5} />
				</button>
				<button
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
					className={`btn join-item ${editorState.isH2 ? "bg-accent" : ""}`}
					title="Heading 2"
				>
					<Heading2 size={20} strokeWidth={2.5} />
				</button>
				<button
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 3 }).run()
					}
					className={`btn join-item ${editorState.isH3 ? "bg-accent" : ""}`}
					title="Heading 3"
				>
					<Heading3 size={20} strokeWidth={2.5} />
				</button>
				<button
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={`btn join-item ${editorState.isBold ? "bg-accent" : ""}`}
					title="Bold"
				>
					<Bold size={20} strokeWidth={2.5} />
				</button>
				<button
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={`btn join-item ${editorState.isItalic ? "bg-accent" : ""}`}
					title="Italic"
				>
					<Italic size={20} strokeWidth={2.5} />
				</button>
				<button
					onClick={() => editor.chain().focus().toggleStrike().run()}
					className={`btn join-item ${editorState.isStrike ? "bg-accent" : ""}`}
					title="Strikethrough"
				>
					<Strikethrough size={20} strokeWidth={2.5} />
				</button>
				<button
					onClick={() => editor.chain().focus().toggleHighlight().run()}
					className={`btn join-item ${editorState.isHighlight ? "bg-accent" : ""}`}
					title="Highlight"
				>
					<Highlighter size={20} strokeWidth={2.5} />
				</button>
				<button
					onClick={() => editor.chain().focus().setTextAlign("left").run()}
					className={`btn join-item ${editorState.isAlignLeft ? "bg-accent" : ""}`}
					title="Align Left"
				>
					<AlignLeft size={20} strokeWidth={2.5} />
				</button>
				<button
					onClick={() => editor.chain().focus().setTextAlign("center").run()}
					className={`btn join-item ${editorState.isAlignCenter ? "bg-accent" : ""}`}
					title="Align Center"
				>
					<AlignCenter size={20} strokeWidth={2.5} />
				</button>
				<button
					onClick={() => editor.chain().focus().setTextAlign("right").run()}
					className={`btn join-item ${editorState.isAlignRight ? "bg-accent" : ""}`}
					title="Align Right"
				>
					<AlignRight size={20} strokeWidth={2.5} />
				</button>
				<button
					onClick={() => editor.chain().focus().setTextAlign("justify").run()}
					className={`btn join-item ${editorState.isAlignJustify ? "bg-accent" : ""}`}
					title="Align Justify"
				>
					<AlignJustify size={20} strokeWidth={2.5} />
				</button>
				<button
					onClick={() => editor.chain().focus().toggleCodeBlock().run()}
					className={`btn join-item ${editorState.isLowLightCode ? "bg-accent" : ""}`}
					title="Code Block"
				>
					<SquareCode size={20} strokeWidth={2.5} />
				</button>
			</div>
		</div>
	);
};

export default MenuBar;
