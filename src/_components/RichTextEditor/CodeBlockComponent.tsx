import { NodeViewContent, NodeViewWrapper, NodeViewProps } from "@tiptap/react";

export default ({
	node: {
		attrs: { language: defaultLanguage },
	},
	updateAttributes,
	extension,
}: NodeViewProps) => (
	<NodeViewWrapper className="code-block relative">
		<select
			contentEditable={false}
			defaultValue={defaultLanguage}
			className="select select-xs max-w-xs"
			onChange={(event) => updateAttributes({ language: event.target.value })}
		>
			<option value="null">auto</option>
			{extension.options.lowlight
				.listLanguages()
				.map((lang: string, index: number) => (
					<option className="text-base-content" key={index} value={lang}>
						{lang}
					</option>
				))}
		</select>
		<pre>
			<NodeViewContent<"code"> as="code" />
		</pre>
	</NodeViewWrapper>
);
