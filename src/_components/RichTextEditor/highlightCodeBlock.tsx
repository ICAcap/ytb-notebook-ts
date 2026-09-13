import type { Element, RootContent } from "hast";
import type { NodeProps } from "@tiptap/static-renderer";
import { lowlight } from "./TiptapExtension";

/**
 * Static renderer never runs an EditorView, so CodeBlockLowlight's
 * ProseMirror decorations (the .hljs-* spans) never get created there.
 * Re-run lowlight directly against the block's text and render its hast
 * tree by hand so read-only views keep the same highlighting as the editor.
 */

function hastToReact(node: RootContent, key: number): React.ReactNode {
	if (node.type === "text") return node.value;
	if (node.type !== "element") return null;

	const element = node as Element;
	const className = Array.isArray(element.properties?.className)
		? element.properties.className.join(" ")
		: undefined;

	return (
		<span key={key} className={className}>
			{element.children.map((child, index) => hastToReact(child, index))}
		</span>
	);
}

export function renderHighlightedCodeBlock({ node }: NodeProps) {
	const code = node.textContent ?? "";
	const language = node.attrs?.language as string | undefined;
	const tree =
		language && lowlight.registered(language)
			? lowlight.highlight(language, code)
			: lowlight.highlightAuto(code);

	return (
		<pre>
			<code className={language ? `language-${language}` : undefined}>
				{tree.children.map((child, index) => hastToReact(child, index))}
			</code>
		</pre>
	);
}
