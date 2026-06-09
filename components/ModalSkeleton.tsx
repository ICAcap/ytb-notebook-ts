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
		isOpen ? dialog.showModal() : dialog.close();
	}, [isOpen]);

	return (
		<dialog ref={dialogRef} onCancel={onClose} className="modal">
			<button onClick={onClose} className="btn btn-circle btn-error">
				<X size={40} />
			</button>
			{children}
		</dialog>
	);
};

export default Modal;
