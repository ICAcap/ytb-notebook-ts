"use client";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { getYoutubeId, YOUTUBE_URL_REGEX } from "../../../../utils/youtube";
import { fetchYouTubeTitle } from "../../../../utils/youtubeFetchTitleServerSide";
import { useEffect, useContext, useState } from "react";
import { AddVideoButtonContext } from "./AddVideoButton";
import Select from "react-select";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";
import {
	RotateCcw,
	AlertCircle,
	Plus,
	Save,
	FolderBookmark,
	ArrowLeftCircle,
} from "lucide-react";
import {
	getExistingVideo,
	upsertYouTubeVideo,
} from "../../../../lib/dbTableAction/videoTableAction";
import { getUserCollectionNameIDs } from "../../../../lib/dbTableAction/collectionTableActions";

// video upsert type for react hook form
type UpsertVideo = {
	youtubeUrl: string;
	customTitle: string;
	collections?: { label: string; value: string }[];
};

export default function AddVideoForm({ userId }: { userId: string }) {
	const {
		modalOpen,
		router,
		showStage2,
		setShowStage2,
		YouTubeIdToAdd,
		foundExistingVid,
		fetchedTitle,
		collectionOptions,
	} = useContext(AddVideoButtonContext) as any;

	const [isNavigating, setIsNavigating] = useState(false); // to block double clicking save button while router is pushing

	useEffect(() => {
		getUserCollectionNameIDs(userId).then((options) => {
			collectionOptions.current = options.toSorted((a, b) =>
				a.label.localeCompare(b.label),
			);
		});
	}, [userId]); // load/store collection options BTS

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<UpsertVideo>();

	//Clear form state when returning to
	//stage 1 or close modal to prevent stale data.
	useEffect(() => {
		if (!modalOpen || !showStage2) {
			reset();
		}
	}, [modalOpen, showStage2]);

	// form submit handler(s)
	const onSubmitYoutubeUrl: SubmitHandler<UpsertVideo> = async (data) => {
		const ytbId = getYoutubeId(data.youtubeUrl);

		if (ytbId) {
			YouTubeIdToAdd.current = ytbId;

			const existing = await getExistingVideo(userId, ytbId);
			foundExistingVid.current = existing ?? null;
			fetchedTitle.current = existing
				? ""
				: ((await fetchYouTubeTitle(ytbId)) ?? "");
		} else {
			YouTubeIdToAdd.current = "";
			fetchedTitle.current = "";
		}
		setShowStage2(true);
	};

	const onSubmitToBackend: SubmitHandler<UpsertVideo> = async (data) => {
		const customTitle = data.customTitle;
		// Extract only the IDs to match the expected backend payload structure.
		const selectedCollectionIds = data.collections
			? data.collections.map((c) => c.value)
			: [];

		const added = await upsertYouTubeVideo(
			userId,
			YouTubeIdToAdd.current,
			customTitle,
			selectedCollectionIds,
		);

		if (added) {
			// Invalidate router cache so when user hits browser back button to go back to last page,
			// they see the newly added video at the bottom of the current page instead of stale cache
			setIsNavigating(true);
			router.refresh();
			router.push(`/videos/${added.videoId}`);
		} else {
			toast.error("Video Addition Failed, Please Try Again", {
				id: "video-addition-failed",
			});
		}
	};

	// ------------------ HTML form ------------------
	return (
		<>
			<Toaster />

			{/* Existing video link - outside form, no form context */}
			{showStage2 && YouTubeIdToAdd.current && foundExistingVid.current && (
				<div className="space-y-4 m-3">
					<div className="alert alert-warning shadow-lg">
						<AlertCircle size={24} />
						<div>
							<h3 className="font-bold">Video Already Exists</h3>
							<p className="text-sm">👇You have already added this video👇</p>
						</div>
					</div>
					<Link
						href={`/videos/${foundExistingVid.current.videoId}`}
						className="btn btn-accent btn-lg w-full font-bold gap-2"
					>
						{foundExistingVid.current.title || "View Existing Video"}
					</Link>
					<button
						onClick={() => {
							setShowStage2(false);
						}}
						className="btn btn-accent gap-2 w-full"
					>
						<ArrowLeftCircle size={25} strokeWidth={2} />
						Go Back To URL Input
					</button>
				</div>
			)}

			<form
				onSubmit={handleSubmit(
					showStage2 ? onSubmitToBackend : onSubmitYoutubeUrl,
				)}
				className="m-3"
			>
				{!showStage2 && (
					<div className="space-y-6">
						<div className="flex items-center gap-3">
							<Plus size={28} className="text-primary" />
							<h2 className="card-title text-2xl font-bold">
								Add YouTube Video
							</h2>
						</div>

						<div className="form-control w-full">
							<label className="label">
								<span className="label-text font-semibold my-0.5">
									YouTube Video URL
								</span>
							</label>
							<input
								type="text"
								placeholder="https://www.youtube.com/watch?v=..."
								className={`input input-bordered w-full ${
									errors?.youtubeUrl ? "input-error" : ""
								}`}
								{...register("youtubeUrl", {
									required: true,
									maxLength: 255,
									pattern: YOUTUBE_URL_REGEX,
								})}
								title="Paste Valid YouTube Video URL Here"
							/>
							{errors?.youtubeUrl && (
								<div className="label mt-2">
									<span className="label-text-alt text-error flex items-center gap-2">
										<AlertCircle size={16} />
										{errors?.youtubeUrl?.type === "required" &&
											"YouTube Video URL is required"}
										{errors?.youtubeUrl?.type === "maxLength" &&
											"YouTube Video URL cannot exceed 255 characters"}
										{errors?.youtubeUrl?.type === "pattern" &&
											"Not a valid YouTube Video URL"}
									</span>
								</div>
							)}
						</div>

						<button
							className="btn btn-accent w-full"
							type="submit"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<span className="loading loading-spinner loading-sm"></span>
							) : null}
							Add YouTube Video
						</button>
					</div>
				)}

				{/* if video id not valid */}
				{showStage2 && !YouTubeIdToAdd.current && (
					<div className="card bg-error/10 border-2 border-error shadow-lg">
						<div className="card-body">
							<div className="flex items-start gap-4">
								<AlertCircle className="text-error shrink-0 mt-1" size={24} />
								<div>
									<h3 className="font-bold text-error mb-2">
										Invalid YouTube URL
									</h3>
									<p className="text-sm text-base-content">
										The YouTube URL you provided cannot yield a valid video ID.
										Please double-check and try again.
									</p>
								</div>
							</div>
							<div className="card-actions justify-end mt-4">
								<button
									type="button"
									onClick={() => setShowStage2(false)}
									className="btn btn-sm btn-outline btn-error gap-2"
								>
									<RotateCcw size={25} strokeWidth={3} />
									Try Again
								</button>
							</div>
						</div>
					</div>
				)}

				{/* if not existing in user profile*/}
				{showStage2 && YouTubeIdToAdd.current && !foundExistingVid.current && (
					<div className="card bg-base-100 shadow-lg border border-base-200">
						<div className="card-body space-y-6">
							<div className="flex items-center gap-3">
								<Save size={28} className="text-success" />
								<h2 className="card-title text-2xl font-bold">
									Almost There...
								</h2>
							</div>

							<div className="form-control w-full">
								<label className="label">
									<span className="label-text font-semibold">
										Custom Video Title
									</span>
								</label>
								<input
									type="text"
									defaultValue={fetchedTitle.current}
									placeholder="My Awesome Custom Video Title..."
									className={`input input-bordered w-full ${
										errors?.customTitle ? "input-error" : ""
									}`}
									{...register("customTitle", {
										required: true,
										maxLength: 255,
									})}
									title="Input Custom Title Here"
								/>
								{errors.customTitle && (
									<div className="label mt-2">
										<span className="label-text-alt text-error flex items-center gap-2">
											<AlertCircle size={16} />
											{errors.customTitle?.type === "required" &&
												"Video title is required"}
											{errors.customTitle?.type === "maxLength" &&
												"Video title cannot exceed 255 characters"}
										</span>
									</div>
								)}
							</div>
							<div className="form-control w-full">
								<label className="label">
									<span className="label-text font-semibold flex items-center gap-2">
										<FolderBookmark size={18} />
										Add to Collection(s)
									</span>
									<span className="label-text-alt text-xs opacity-70">
										Optional
									</span>
								</label>
								<Controller
									name="collections"
									control={control}
									render={({ field }) => (
										<Select
											{...field}
											isMulti
											isSearchable
											options={collectionOptions.current}
											placeholder="Select Collection(s)..."
											classNamePrefix="react-select"
											className="text-black"
										/>
									)}
								/>
							</div>

							<button
								className="btn btn-primary w-full gap-2"
								type="submit"
								disabled={isSubmitting || isNavigating}
							>
								{isSubmitting || isNavigating ? (
									<span className="loading loading-spinner loading-sm"></span>
								) : (
									<Save size={20} />
								)}
								Save Video
							</button>
							<button
								onClick={() => {
									setShowStage2(false);
								}}
								className="btn btn-accent gap-2 w-full"
							>
								<ArrowLeftCircle size={25} strokeWidth={2} />
								Go Back To URL Input
							</button>
						</div>
					</div>
				)}
			</form>
		</>
	);
}
