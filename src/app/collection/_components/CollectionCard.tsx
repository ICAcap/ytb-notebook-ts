import { Folder, Trash, Pencil } from "lucide-react";

type CollectionCardProps = {
	id: string;
	name: string;
};

export default function CollectionCard({ id, name }: CollectionCardProps) {
	return (
		<div
			className="card card-compact hover:bg-base-200 cursor-pointer transition-colors select-none group"
		>
			<div className="card-body items-center text-center gap-3">
				<Folder className="w-28 h-28 text-warning" />
				<span className="card-title text-sm font-semibold line-clamp-2 justify-center">
					{name}
				</span>
				<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
					<button className="btn btn-square btn-sm btn-info">
						<Pencil className="w-4 h-4" />
					</button>
					<button className="btn btn-square btn-sm btn-error">
						<Trash className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
