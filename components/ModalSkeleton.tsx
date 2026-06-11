"use client";
import { ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";

// Reference
// https://medium.com/@dimterion/modals-with-html-dialog-element-in-javascript-and-react-fb23c885d62e
type Props = { isOpen: boolean; onClose: () => void; children: ReactNode };

const Modal = ({ isOpen, onClose, children }: Props) => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (isOpen) {
			// Close any existing non-modal state to prevent InvalidStateError when showModal() is called twice
			if (dialog.open) dialog.close();
			dialog.showModal();
		} else if (dialog.open) {
			dialog.close();
		}
	}, [isOpen]);

	return (
		<dialog ref={dialogRef} onCancel={onClose} className="modal cursor-default backdrop:bg-transparent">
			<div className="relative modal-box">
				<button
					onClick={onClose}
					className="btn btn-sm btn-circle btn-ghost btn-error absolute top-2 right-2 cursor-pointer"
				>
					<X size={20} />
				</button>
				{children}
			</div>
		</dialog>
	);
};

export default Modal;
