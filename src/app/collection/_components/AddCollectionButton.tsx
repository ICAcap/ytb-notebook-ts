"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import Modal from "../../../../components/ModalSkeleton";
import CollectionForm from "./CollectionForm";

/**
 * AddCollectionButton component provides a user interface element to trigger
 * the creation of a new collection via a modal dialog.
 *
 * It manages the visibility state of the modal and renders a
 * CollectionForm within it when activated.
 */
export default function AddCollectionButton() {
	const [modal, setModal] = useState(false);

	return (
		<div>
			<button
				onClick={() => {
					setModal(true);
				}}
				className="btn btn-primary btn-sm gap-2"
			>
				<Plus size={18} />
				New Collection
			</button>

			<Modal isOpen={modal} onClose={() => setModal(false)}>
				<CollectionForm />
			</Modal>
		</div>
	);
}
