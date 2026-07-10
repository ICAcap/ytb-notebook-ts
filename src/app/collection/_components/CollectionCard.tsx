"use client";

import { Folder, Trash, Pencil, AlertCircle } from "lucide-react";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { deleteCollectionById } from "../../../../lib/dbTableAction/collectionTableActions";
import Modal from "../../../_components/ModalSkeleton";
import CollectionForm from "./CollectionForm";
import { CollectionContext } from "./CollectionContextProvider";
import toast from "react-hot-toast";

type CollectionCardProps = {
	id: string;
	name: string;
	videoCount: number;
};

export default function CollectionCard({
	id,
	name,
	videoCount,
}: CollectionCardProps) {
	const [pencilModalOpen, setPencilModalOpen] = useState(false);
	const [trashModalOpen, setTrashModalOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const contextValue = useContext(CollectionContext);
	const userId = contextValue?.userId || "";
	const router = useRouter();

	function onClick() {
		// redirect to show videos belonging to this collection
		const newSearchParams = new URLSearchParams({ collection: name });
		router.push("/videos?" + newSearchParams.toString());
	}

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await deleteCollectionById(id, userId);
			setTrashModalOpen(false);
			toast.success(`Collection "${name}" deleted successfully!`, {
				id: "collection-deletion-success",
			});
			router.refresh();
		} catch (error) {
			toast.error(`Failed to delete collection "${name}". Please try again.`, {
				id: "collection-deletion-failed",
			});
			setIsDeleting(false);
		}
	};

	return (
		<div
			title={name}
			className="card card-compact indicator w-full hover:bg-base-200 cursor-pointer transition-colors select-none group"
		>
			{videoCount > 0 && (
				<span className="indicator-item badge badge-primary badge-sm rounded-full">
					{videoCount}
				</span>
			)}
			<div
				onClick={onClick}
				className="card-body items-center text-center gap-3"
			>
				<Folder className="w-28 h-28 text-warning" />
				<span className="card-title text-sm font-semibold justify-center w-full min-w-0">
					<span className="truncate min-w-0">{name}</span>
				</span>
			</div>
			<div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 group-hover:bg-accent transition-all">
				<button
					className="btn btn-square btn-sm btn-info"
					onClick={() => setPencilModalOpen(true)}
				>
					<Pencil className="w-4 h-4" />
				</button>
				<button
					className="btn btn-square btn-sm btn-error"
					onClick={() => setTrashModalOpen(true)}
				>
					<Trash className="w-4 h-4" />
				</button>
			</div>

			{/* Editing Collection Modal */}
			<Modal isOpen={pencilModalOpen} onClose={() => setPencilModalOpen(false)}>
				{pencilModalOpen && (
					<CollectionForm
						userId={userId}
						collectionID={id}
						existingTitle={name}
						setPencilModalOpen={setPencilModalOpen}
					/>
				)}
			</Modal>

			{/* Delete Collection Modal */}
			<Modal isOpen={trashModalOpen} onClose={() => setTrashModalOpen(false)}>
				<div role="dialog" className="flex flex-col gap-6">
					<div className="flex items-center gap-3">
						<AlertCircle size={40} className="text-error shrink-0" />
						<span className="text-lg font-semibold">
							Confirm Collection Removal
						</span>
					</div>
					<div className="text-xl font-bold text-error break-word">{name}</div>
					<p className="text-sm text-base-content/70">
						Videos in this collection won't be removed, only the collection
						itself.
					</p>
					<div className="flex gap-3 justify-between">
						<button
							onClick={() => setTrashModalOpen(false)}
							className="btn btn-outline flex-1"
						>
							Cancel
						</button>
						<button
							className="btn btn-error flex-1"
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? (
								<>
									<span className="loading loading-spinner loading-sm"></span>
									Removing...
								</>
							) : (
								"Remove"
							)}
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
