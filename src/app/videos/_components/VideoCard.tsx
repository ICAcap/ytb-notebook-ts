"use client";

import { getThumbnailUrl } from "../../../../utils/youtube";
import { formatTimeStamp } from "../../../../utils/formatTimeStamp";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Pencil, AlertCircle } from "lucide-react";
import {
	deleteVideo,
	VideoCardType,
} from "../../../../lib/dbTableAction/videoTableAction";
import Modal from "../../../../components/ModalSkeleton";
import { useState, memo, Suspense } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default memo(function VideoCard({
	videoId,
	youtubeVidID,
	title,
	lastPlayedTime,
	createdAt,
}: VideoCardType) {
	const thumbnailUrl = youtubeVidID ? getThumbnailUrl(youtubeVidID) : null;
	const [trashModalOpen, setTrashModalOpen] = useState(false);
	const [pencilModalOpen, setPencilModalOpen] = useState(false);

	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await deleteVideo(videoId);
			toast.custom(
				<div role="alert" className="alert alert-success mt-4 transition-all">
					<span>Video "{title}" deleted successfully!</span>
				</div>,
				{
					id: "video-deletion-success",
				},
			);
		} catch (error) {
			toast.custom(
				<div role="alert" className="alert alert-warning mt-4">
					<AlertCircle size={16} />
					<span>Failed to delete video "{title}". Please try again.</span>
				</div>,
				{
					id: "video-deletion-failed",
				},
			);
		} finally {
			router.refresh();
			setTrashModalOpen(false);
			setIsDeleting(false);
		}
	};

	return (
		<>
			{/* Thumbnail Frame */}
			<Link
				href={`/videos/${videoId}`}
				className="relative hover-3d cursor-pointer"
			>
				<div>
					<Suspense fallback={<div className="w-24 h-14 bg-gray-200" />}>
						{thumbnailUrl ? (
							<Image
								src={thumbnailUrl}
								alt={title}
								width={200}
								height={113}
								className="w-full h-full rounded-xl"
								loading="eager"
							/>
						) : (
							<div className="w-full h-full">
								<span className="text-xs font-semibold text-gray-600">?</span>
							</div>
						)}
					</Suspense>
				</div>
				{/* 8 empty divs needed for the 3D effect */}
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
			</Link>

			{/* Details */}
			<div className="list-col-grow">
				<Link
					href={`/videos/${videoId}`}
					className="font-semibold text-base hover:text-primary transition-colors duration-150 line-clamp-2"
				>
					{title}
				</Link>
				<div className="text-xs font-medium text-base-content/60 mt-1">
					Last Watched: {formatTimeStamp(lastPlayedTime)}
				</div>
				<div className="text-xs text-base-content/50 mt-0.5">
					Added: {createdAt.toLocaleDateString()}
				</div>
			</div>

			{/* Actions */}
			<div className="flex gap-2">
				<button
					title="Delete Video"
					type="button"
					onClick={() => setTrashModalOpen(true)}
					className="btn btn-ghost btn-sm"
				>
					<Trash2 className="w-5 h-5 text-error" />
				</button>
				<button
					title="Edit Video"
					type="button"
					onClick={() => setPencilModalOpen(true)}
					className="btn btn-ghost btn-sm"
				>
					<Pencil className="w-5 h-5 text-info" />
				</button>
			</div>

			{/* Modals */}

			{/* Video DELETE modal */}
			<Modal isOpen={trashModalOpen} onClose={() => setTrashModalOpen(false)}>
				<div role="dialog" className="flex flex-col gap-6">
					<div className="flex items-center gap-3">
						<AlertCircle size={40} className="text-error shrink-0" />
						<span className="text-lg font-semibold">
							Warning, Deleting Video Will Also Delete All Related Notes!{" "}
						</span>
					</div>
					<div className="flex gap-3 justify-between">
						<button
							onClick={() => setTrashModalOpen(false)}
							type="button"
							className="btn btn-outline flex-1"
						>
							Cancel
						</button>
						<button
							className="btn btn-error flex-1"
							onClick={handleDelete}
							type="button"
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
			{/* EDITING Modal */}

			<Modal isOpen={pencilModalOpen} onClose={() => setPencilModalOpen(false)}>
				Pencil Modal Placeholder
			</Modal>
		</>
	);
});
