import { JSONContent } from "@tiptap/react";

export function tiptapToText(doc: JSONContent): string {
  const parts: string[] = [];
  const stack: JSONContent[] = [doc];

  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.text) parts.push(node.text);
    if (node.content) {
      for (let i = node.content.length - 1; i >= 0; i--) {
        stack.push(node.content[i]);
      }
    }
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}
