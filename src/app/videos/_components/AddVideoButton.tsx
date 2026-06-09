"use client";

import { Plus } from "lucide-react";
import { useRef, useState, createContext } from "react";
import Modal from "../../../../components/ModalSkeleton";
import AddVideoForm from "./AddVideoForm";
import { useRouter } from "next/navigation";
import { VideoCardType } from "../../../../lib/dbTableAction/videoTableAction";

export const AddVideoButtonContext = createContext({});

export default function AddVideoButton({ userId }: { userId: string }) {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const [showStage2, setShowStage2] = useState(false);
	const YouTubeIdToAdd = useRef("");
	const foundExistingVid = useRef<VideoCardType | null>(null);
	const fetchedTitle = useRef("");
	const collectionOptions = useRef<{ label: string; value: string }[]>([]);

	return (
		<AddVideoButtonContext.Provider
			value={{
				router,
				showStage2,
				setShowStage2,
				YouTubeIdToAdd,
				foundExistingVid,
				fetchedTitle,
				collectionOptions,
			}}
		>
			<div>
				<button
					onClick={() => setOpen(true)}
					className="btn btn-primary btn-sm gap-2"
				>
					<Plus size={18} />
					New Video
				</button>

				<Modal
					isOpen={open}
					// clean up context passed
					onClose={() => {
						setOpen(false);
						setShowStage2(false);
						YouTubeIdToAdd.current = "";
						foundExistingVid.current = null;
						fetchedTitle.current = "";
					}}
				>
					<AddVideoForm userId={userId} />
				</Modal>
			</div>
		</AddVideoButtonContext.Provider>
	);
}
