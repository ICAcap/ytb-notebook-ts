import { NoteWithVideo } from "../../../../lib/dbTableAction/noteTableAction";
import { formatTimeStamp } from "../../../../utils/formatTimeStamp";

export default function NoteListItem({ note }: { note: NoteWithVideo }) {
	return (
		<div className="flex flex-col gap-1 p-2 border-b border-base-300">
			<span className="text-sm text-base-content/70">
				{formatTimeStamp(note.startTime)} - {formatTimeStamp(note.endTime)}
			</span>
			<span style={{ color: note.color }}>{note.contentText}</span>
		</div>
	);
}
