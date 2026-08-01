"use client";

import { Plus } from "lucide-react";
import { useRef, useState, createContext } from "react";
import Modal from "../../../_components/ModalSkeleton";
import AddVideoForm from "./AddVideoForm";
import { useRouter } from "next/navigation";
import { VideoDetailType } from "../../../../lib/dbTableAction/videoTableAction";
import { CollectionOptions } from "../../../../lib/dbTableAction/collectionTableActions";

export const AddVideoButtonContext = createContext({});

export default function AddVideoButton({ userId }: { userId: string }) {
	const [modalOpen, setModalOpen] = useState(false);
	const router = useRouter();
	const [showDetailForm, setShowDetailForm] = useState(false);
	const YouTubeIdToAdd = useRef("");
	const foundExistingVid = useRef<VideoDetailType | null>(null);
	const fetchedTitle = useRef("");
	const collectionOptions = useRef<CollectionOptions>([]);

	return (
		<AddVideoButtonContext.Provider
			value={{
				modalOpen,
				router,
				showDetailForm,
				setShowDetailForm,
				YouTubeIdToAdd,
				foundExistingVid,
				fetchedTitle,
				collectionOptions,
			}}
		>
			<div>
				<button
					onClick={() => setModalOpen(true)}
					className="btn btn-primary rounded-3xl text-xl gap-2"
				>
					<Plus size={30} />
					New Video
				</button>

				<Modal
					isOpen={modalOpen}
					// clean up context passed
					onClose={() => {
						setModalOpen(false);
						setShowDetailForm(false);
						YouTubeIdToAdd.current = "";
						foundExistingVid.current = null;
						fetchedTitle.current = "";
					}}
				>
					{modalOpen && <AddVideoForm userId={userId} />}
				</Modal>
			</div>
		</AddVideoButtonContext.Provider>
	);
}
