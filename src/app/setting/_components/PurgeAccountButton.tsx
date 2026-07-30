"use client";

import { AlertCircle } from "lucide-react";
import { purgeUser } from "../../../../lib/dbTableAction/userTableAction";
import { authClient } from "../../../../lib/auth-client";
import Modal from "../../../_components/ModalSkeleton";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const CONFIRM_TEXT = "DELETE_ACCOUNT";

export default function PurgeAccountButton({ userId }: { userId: string }) {
	const [modalOpen, setModalOpen] = useState(false);
	const [confirmText, setConfirmText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const closeModal = () => {
		setModalOpen(false);
		setConfirmText("");
	};

	const handlePurge = async () => {
		setIsDeleting(true);
		try {
			const deletedUser = await purgeUser(userId);
			if (!deletedUser) {
				throw new Error("Purge failed");
			}
			await authClient.signOut();
			localStorage.clear();
			router.push("/");
		} catch {
			toast.error("Failed to delete your account. Please try again.", {
				id: "purge-account-failed",
			});
			setIsDeleting(false);
		}
	};

	return (
		<>
			<button
				type="button"
				className="btn btn-error btn-outline w-fit"
				onClick={() => setModalOpen(true)}
			>
				Delete My Account
			</button>

			<Modal isOpen={modalOpen} onClose={closeModal}>
				<div role="dialog" className="flex flex-col gap-6">
					<div className="flex items-center gap-3">
						<AlertCircle size={40} className="text-error shrink-0" />
						<span className="text-lg font-semibold">
							Confirm Account Deletion
						</span>
					</div>
					<p className="text-lg font-semibold">
						This will permanently delete your account and all videos,
						collections, and notes. This cannot be undone.
					</p>
					<label className="flex flex-col gap-2">
						<span className="text-sm font-medium">
							Type <span className="font-bold">{`${CONFIRM_TEXT}`}</span> to
							confirm
						</span>
						<input
							type="text"
							value={confirmText}
							onChange={(e) => setConfirmText(e.target.value)}
							className="input input-bordered w-full"
							autoComplete="off"
						/>
					</label>
					<div className="flex gap-3 justify-between">
						<button
							onClick={closeModal}
							type="button"
							className="btn btn-outline flex-1"
						>
							Cancel
						</button>
						<button
							className="btn btn-error flex-1"
							onClick={handlePurge}
							type="button"
							disabled={confirmText !== CONFIRM_TEXT || isDeleting}
						>
							{isDeleting ? (
								<>
									<span className="loading loading-spinner loading-sm"></span>
									Deleting...
								</>
							) : (
								"Delete Account"
							)}
						</button>
					</div>
				</div>
			</Modal>
		</>
	);
}
