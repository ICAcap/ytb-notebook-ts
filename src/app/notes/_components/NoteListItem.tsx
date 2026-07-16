import { renderToReactElement } from "@tiptap/static-renderer";
import { NoteWithVideo } from "../../../../lib/dbTableAction/noteTableAction";
import { formatTimeStamp } from "../../../../utils/formatTimeStamp";
import { TiptapExtensions } from "@/_components/RichTextEditor/TiptapExtension";
import { JSONContent } from "@tiptap/react";

export default function NoteListItem({ note }: { note: NoteWithVideo }) {
	const updatedAtLabel = note.updatedAt.toLocaleString("en-US", {
		month: "2-digit",
		day: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	return (
		<div
			className="card rounded-lg w-full min-w-0"
			style={{ boxShadow: `0 4px 8px ${note.color}80` }}
		>
			<div
				className="card-title rounded-t-lg flex gap-2 justify-end"
				style={{ backgroundColor: note.color }}
			>
				<div className="flex flex-row w-full justify-between gap-1 p-2 border-b border-base-300">
					<span
						className="text-xs text-base-content/60 truncate justify-center"
						title={updatedAtLabel}
					>
						updated {updatedAtLabel}
					</span>
					<div className="flex flex-row gap-2 items-center">
						<button className="btn btn-xs btn-primary">
							{formatTimeStamp(note.startTime)}
						</button>

						{note.startTime !== note.endTime && (
							<>
								<span className="text-2xl">➨</span>
								<button className="btn btn-xs btn-primary">
									{formatTimeStamp(note.endTime)}
								</button>
							</>
						)}
					</div>
				</div>
			</div>
			<div className="tiptap prose p-3 prose-sm max-w-full min-w-0 wrap-break-word text-wrap overflow-x-auto">
				{/* Render static content here - */}
				{/* reference: https://tiptap.dev/docs/editor/api/utilities/static-renderer#generating-react-components-from-json */}
				{renderToReactElement({
					content: note.content as JSONContent,
					extensions: TiptapExtensions,
				})}
			</div>
		</div>
	);
}
