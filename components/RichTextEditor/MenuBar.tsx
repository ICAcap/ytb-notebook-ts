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
	List,
	ListOrdered,
} from "lucide-react";

const activeClass =
	"flex items-center justify-center w-8 h-8 rounded-full bg-accent";
const inactiveClass = "flex items-center justify-center w-8 h-8 rounded-full";

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
			isBulletList: editor?.isActive("bulletList") ?? false,
			isOrderedList: editor?.isActive("orderedList") ?? false,
		}),
	})!;

	if (!editor) {
		return null;
	}

	return (
		<div className="control-group flex justify-center">
			<div className="join rounded-lg overflow-hidden">
				<button
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
					className="btn btn-square join-item"
					title="Heading 1 (Ctrl+Alt+1 / ⌘+Alt+1)"
				>
					<span className={editorState.isH1 ? activeClass : inactiveClass}>
						<Heading1 size={20} strokeWidth={2.5} />
					</span>
				</button>
				<button
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
					className="btn btn-square join-item"
					title="Heading 2 (Ctrl+Alt+2 / ⌘+Alt+2)"
				>
					<span className={editorState.isH2 ? activeClass : inactiveClass}>
						<Heading2 size={20} strokeWidth={2.5} />
					</span>
				</button>
				<button
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 3 }).run()
					}
					className="btn btn-square join-item"
					title="Heading 3 (Ctrl+Alt+3 / ⌘+Alt+3)"
				>
					<span className={editorState.isH3 ? activeClass : inactiveClass}>
						<Heading3 size={20} strokeWidth={2.5} />
					</span>
				</button>
				<button
					onClick={() => editor.chain().focus().toggleBold().run()}
					className="btn btn-square join-item"
					title="Bold (Ctrl+B / ⌘+B)"
				>
					<span className={editorState.isBold ? activeClass : inactiveClass}>
						<Bold size={20} strokeWidth={2.5} />
					</span>
				</button>
				<button
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className="btn btn-square join-item"
					title="Italic (Ctrl+I / ⌘+I)"
				>
					<span className={editorState.isItalic ? activeClass : inactiveClass}>
						<Italic size={20} strokeWidth={2.5} />
					</span>
				</button>
				<button
					onClick={() => editor.chain().focus().toggleStrike().run()}
					className="btn btn-square join-item"
					title="Strikethrough (Ctrl+Shift+S / ⌘+Shift+S)"
				>
					<span className={editorState.isStrike ? activeClass : inactiveClass}>
						<Strikethrough size={20} strokeWidth={2.5} />
					</span>
				</button>
				<button
					onClick={() => editor.chain().focus().toggleHighlight().run()}
					className="btn btn-square join-item"
					title="Highlight (Ctrl+Shift+H / ⌘+Shift+H)"
				>
					<span
						className={editorState.isHighlight ? activeClass : inactiveClass}
					>
						<Highlighter size={20} strokeWidth={2.5} />
					</span>
				</button>
				<button
					onClick={() => editor.chain().focus().setTextAlign("left").run()}
					className="btn btn-square join-item"
					title="Align Left (Ctrl+Shift+L / ⌘+Shift+L)"
				>
					<span
						className={editorState.isAlignLeft ? activeClass : inactiveClass}
					>
						<AlignLeft size={20} strokeWidth={2.5} />
					</span>
				</button>
				<button
					onClick={() => editor.chain().focus().setTextAlign("center").run()}
					className="btn btn-square join-item"
					title="Align Center (Ctrl+Shift+E / ⌘+Shift+E)"
				>
					<span
						className={editorState.isAlignCenter ? activeClass : inactiveClass}
					>
						<AlignCenter size={20} strokeWidth={2.5} />
					</span>
				</button>
				<button
					onClick={() => editor.chain().focus().setTextAlign("right").run()}
					className="btn btn-square join-item"
					title="Align Right (Ctrl+Shift+R / ⌘+Shift+R)"
				>
					<span
						className={editorState.isAlignRight ? activeClass : inactiveClass}
					>
						<AlignRight size={20} strokeWidth={2.5} />
					</span>
				</button>
				<button
					onClick={() => editor.chain().focus().setTextAlign("justify").run()}
					className="btn btn-square join-item"
					title="Align Justify (Ctrl+Shift+J / ⌘+Shift+J)"
				>
					<span
						className={editorState.isAlignJustify ? activeClass : inactiveClass}
					>
						<AlignJustify size={20} strokeWidth={2.5} />
					</span>
				</button>
				<button
					onClick={() => editor.chain().focus().toggleCodeBlock().run()}
					className="btn btn-square join-item"
					title="Code Block (Ctrl+Alt+C / ⌘+Alt+C)"
				>
					<span
						className={editorState.isLowLightCode ? activeClass : inactiveClass}
					>
						<SquareCode size={20} strokeWidth={2.5} />
					</span>
				</button>
				<button
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className="btn btn-square join-item"
					title="Bullet List (Ctrl+Shift+8 / ⌘+Shift+8)"
				>
					<span
						className={editorState.isBulletList ? activeClass : inactiveClass}
					>
						<List size={20} strokeWidth={2.5} />
					</span>
				</button>
				<button
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className="btn btn-square join-item"
					title="Ordered List (Ctrl+Shift+7 / ⌘+Shift+7)"
				>
					<span
						className={editorState.isOrderedList ? activeClass : inactiveClass}
					>
						<ListOrdered size={20} strokeWidth={2.5} />
					</span>
				</button>
			</div>
		</div>
	);
};

export default MenuBar;
