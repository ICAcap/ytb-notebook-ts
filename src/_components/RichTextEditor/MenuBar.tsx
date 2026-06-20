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
	Redo2,
	Undo2,
	Underline,
	Baseline,
	Ban,
} from "lucide-react";
import { useState } from "react";

// styling
const activeClass =
	"flex items-center justify-center w-8 h-8 rounded-full bg-accent";
const inactiveClass = "flex items-center justify-center w-8 h-8 rounded-full";

// color picker sub-component
// reference: https://tiptap.dev/docs/editor/extensions/functionality/color
const TextColorPicker = ({ editor }: { editor: Editor | null }) => {
	// preset colors
	const colors = [
		{ hex: "#E53935", key: "isTextRed", title: "Red" },
		{ hex: "#F4511E", key: "isTextOrange", title: "Orange" },
		{ hex: "#F9A825", key: "isTextYellow", title: "Gold" },
		{ hex: "#1E88E5", key: "isTextBlue", title: "Blue" },
		{ hex: "#00897B", key: "isTextTeal", title: "Teal" },
		{ hex: "#43A047", key: "isTextGreen", title: "Green" },
	];

	const editorState = useEditorState({
		editor,
		selector: ({ editor }) => ({
			// preset colors
			isTextRed: editor?.isActive("textStyle", { color: "#E53935" }),
			isTextOrange: editor?.isActive("textStyle", { color: "#F4511E" }),
			isTextYellow: editor?.isActive("textStyle", { color: "#F9A825" }),
			isTextBlue: editor?.isActive("textStyle", { color: "#1E88E5" }),
			isTextTeal: editor?.isActive("textStyle", { color: "#00897B" }),
			isTextGreen: editor?.isActive("textStyle", { color: "#43A047" }),
		}),
	});

	return (
		<div className="control-group rounded-2xl dropdown-content bg-accent p-2 w-fit min-w-max">
			<div className="flex flex-row gap-1 flex-wrap justify-center">
				{colors.map(({ hex, key, title }) => (
					<button
						key={hex}
						title={title}
						onClick={() => editor?.chain().focus().setColor(hex).run()}
					>
						<div
							className={`w-5 h-5 rounded-full ${
								editorState?.[key as keyof typeof editorState]
									? "border-4 border-accent-content"
									: ""
							}`}
							style={{ backgroundColor: hex }}
						/>
					</button>
				))}
				{/* unset text color */}
				<button
					title="Unset Text Color"
					onClick={() => editor?.chain().focus().unsetColor().run()}
				>
					<Ban size={20} strokeWidth={2.5} className="w-5 h-5 rounded-full" />
				</button>
			</div>
		</div>
	);
};

// main component
const MenuBar = ({ editor }: { editor: Editor | null }) => {
	//reference: https://tiptap.dev/docs/editor/getting-started/install/react#reacting-to-editor-state-changes
	const [colorPickerOpen, setColorPickerOpen] = useState(false);
	const editorState = useEditorState({
		editor,
		selector: ({ editor }) => ({
			canUndo: editor?.can().chain().focus().undo().run() ?? false,
			canRedo: editor?.can().chain().focus().redo().run() ?? false,
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
			isUnderline: editor?.isActive("underline") ?? false,
			textColor: editor?.getAttributes("textStyle").color,
		}),
	})!;

	if (!editor) {
		return null;
	}

	return (
		<div className="control-group flex justify-center mt-2">
			<div className="flex gap-1 flex-wrap">
				{/* History controls */}
				<button
					onClick={() => editor.chain().focus().undo().run()}
					disabled={!editorState.canUndo}
					className="btn btn-square"
					type="button"
					title="Undo (Ctrl + Z / ⌘ + Z)"
				>
					<Undo2 size={20} strokeWidth={2.5} />
				</button>
				<button
					onClick={() => editor.chain().focus().redo().run()}
					disabled={!editorState.canRedo}
					className="btn btn-square"
					type="button"
					title="Redo (Ctrl + Y / ⌘ + Y)"
				>
					<Redo2 size={20} strokeWidth={2.5} />
				</button>

				{/* Heading level controls */}
				<button
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
					className="btn btn-square"
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
					className="btn btn-square"
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
					className="btn btn-square"
					title="Heading 3 (Ctrl+Alt+3 / ⌘+Alt+3)"
				>
					<span className={editorState.isH3 ? activeClass : inactiveClass}>
						<Heading3 size={20} strokeWidth={2.5} />
					</span>
				</button>

				{/* Text color and palette toggle */}
				<div className="dropdown" title="Text Color">
					<button tabIndex={0} className="btn btn-square">
						<Baseline
							size={20}
							strokeWidth={2.5}
							style={{ color: editorState.textColor || "currentColor" }}
						/>
					</button>
					<TextColorPicker editor={editor} />
				</div>

				{/* Text styling controls */}
				<button
					onClick={() => editor.chain().focus().toggleBold().run()}
					className="btn btn-square"
					title="Bold (Ctrl+B / ⌘+B)"
				>
					<span className={editorState.isBold ? activeClass : inactiveClass}>
						<Bold size={20} strokeWidth={2.5} />
					</span>
				</button>
				<button
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className="btn btn-square"
					title="Italic (Ctrl+I / ⌘+I)"
				>
					<span className={editorState.isItalic ? activeClass : inactiveClass}>
						<Italic size={20} strokeWidth={2.5} />
					</span>
				</button>
				<button
					onClick={() => editor.chain().focus().toggleUnderline().run()}
					className="btn btn-square"
					title="Underline (Ctrl+U / ⌘+U)"
				>
					<span
						className={editorState.isUnderline ? activeClass : inactiveClass}
					>
						<Underline size={20} strokeWidth={2.5} />
					</span>
				</button>
				<button
					onClick={() => editor.chain().focus().toggleStrike().run()}
					className="btn btn-square"
					title="Strikethrough (Ctrl+Shift+S / ⌘+Shift+S)"
				>
					<span className={editorState.isStrike ? activeClass : inactiveClass}>
						<Strikethrough size={20} strokeWidth={2.5} />
					</span>
				</button>
				<button
					onClick={() => editor.chain().focus().toggleHighlight().run()}
					className="btn btn-square"
					title="Highlight (Ctrl+Shift+H / ⌘+Shift+H)"
				>
					<span
						className={editorState.isHighlight ? activeClass : inactiveClass}
					>
						<Highlighter size={20} strokeWidth={2.5} />
					</span>
				</button>

				{/* Text alignment controls */}
				<button
					onClick={() => editor.chain().focus().setTextAlign("left").run()}
					className="btn btn-square"
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
					className="btn btn-square"
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
					className="btn btn-square"
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
					className="btn btn-square"
					title="Align Justify (Ctrl+Shift+J / ⌘+Shift+J)"
				>
					<span
						className={editorState.isAlignJustify ? activeClass : inactiveClass}
					>
						<AlignJustify size={20} strokeWidth={2.5} />
					</span>
				</button>

				{/* Block and list controls */}
				<button
					onClick={() => editor.chain().focus().toggleCodeBlock().run()}
					className="btn btn-square"
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
					className="btn btn-square"
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
					className="btn btn-square"
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
