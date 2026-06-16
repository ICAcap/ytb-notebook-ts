import { Editor } from "@tiptap/react";
import {
	Heading1,
	Heading2,
	Heading3,
	Pilcrow,
	Bold,
	Italic,
	Strikethrough,
	Highlighter,
	AlignLeft,
	AlignCenter,
	AlignRight,
	AlignJustify,
} from "lucide-react";

const MenuBar = ({ editor }: { editor: Editor | null }) => {
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
					className={`btn join-item ${
						editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""
					}`}
					title="Heading 1"
				>
					<Heading1 size={16} strokeWidth={2} />
				</button>
				<button
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
					className={`btn join-item ${
						editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""
					}`}
					title="Heading 2"
				>
					<Heading2 size={16} strokeWidth={2} />
				</button>
				<button
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 3 }).run()
					}
					className={`btn join-item ${
						editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""
					}`}
					title="Heading 3"
				>
					<Heading3 size={16} strokeWidth={2} />
				</button>
				<button
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={`btn join-item ${
						editor.isActive("bold") ? "bg-accent" : ""
					}`}
					title="Bold"
				>
					<Bold size={16} strokeWidth={2} />
				</button>
				<button
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={`btn join-item ${
						editor.isActive("italic") ? "bg-accent" : ""
					}`}
					title="Italic"
				>
					<Italic size={16} strokeWidth={2} />
				</button>
				<button
					onClick={() => editor.chain().focus().toggleStrike().run()}
					className={`btn join-item ${
						editor.isActive("strike") ? "bg-accent" : ""
					}`}
					title="Strikethrough"
				>
					<Strikethrough size={16} strokeWidth={2} />
				</button>
				<button
					onClick={() => editor.chain().focus().toggleHighlight().run()}
					className={`btn join-item ${
						editor.isActive("highlight") ? "bg-accent" : ""
					}`}
					title="Highlight"
				>
					<Highlighter size={16} strokeWidth={2} />
				</button>
				<button
					onClick={() => editor.chain().focus().setTextAlign("left").run()}
					className={`btn join-item ${
						editor.isActive({ textAlign: "left" }) ? "bg-accent" : ""
					}`}
					title="Align Left"
				>
					<AlignLeft size={16} strokeWidth={2} />
				</button>
				<button
					onClick={() => editor.chain().focus().setTextAlign("center").run()}
					className={`btn join-item ${
						editor.isActive({ textAlign: "center" }) ? "bg-accent" : ""
					}`}
					title="Align Center"
				>
					<AlignCenter size={16} strokeWidth={2} />
				</button>
				<button
					onClick={() => editor.chain().focus().setTextAlign("right").run()}
					className={`btn join-item ${
						editor.isActive({ textAlign: "right" }) ? "bg-accent" : ""
					}`}
					title="Align Right"
				>
					<AlignRight size={16} strokeWidth={2} />
				</button>
				<button
					onClick={() => editor.chain().focus().setTextAlign("justify").run()}
					className={`btn join-item ${
						editor.isActive({ textAlign: "justify" }) ? "bg-accent" : ""
					}`}
					title="Align Justify"
				>
					<AlignJustify size={16} strokeWidth={2} />
				</button>
			</div>
		</div>
	);
};

export default MenuBar;
