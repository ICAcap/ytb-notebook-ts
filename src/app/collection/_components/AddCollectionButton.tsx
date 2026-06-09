"use client";

import { Plus } from "lucide-react";
import { useState, useContext } from "react";
import Modal from "../../../../components/ModalSkeleton";
import CollectionForm from "./CollectionForm";
import { CollectionContext } from "./CollectionContextProvider";

/**
 * AddCollectionButton component provides a user interface element to trigger
 * the creation of a new collection via a modal dialog.
 *
 * It manages the visibility state of the modal and renders a
 * CollectionForm within it when activated.
 */
export default function AddCollectionButton() {
	const [addModalOpen, setAddModalOpen] = useState(false);
	const contextValue = useContext(CollectionContext);
	const userId = contextValue?.userId || "";

	return (
		<div>
			<button
				onClick={() => {
					setAddModalOpen(true);
				}}
				className="btn btn-primary btn-sm gap-2"
			>
				<Plus size={18} />
				New Collection
			</button>

			<Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)}>
				<CollectionForm userId={userId} />
			</Modal>
		</div>
	);
}
