"use client";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { getYoutubeId, YOUTUBE_URL_REGEX } from "../../../../utils/youtube";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import {
	RotateCcw,
	AlertCircle,
	Plus,
	Save,
	FolderBookmark,
} from "lucide-react";
import {
	getExistingVideo,
	upsertYouTubeVideo,
} from "../../../../lib/dbTableAction/videoTableAction";
import { getUserCollectionNameIDs } from "../../../../lib/dbTableAction/collectionTableActions";
import VideoCard from "@/app/videos/_components/VideoCard";
import { VideoCardType } from "../../../../lib/dbTableAction/videoTableAction";

// video addition type
type AddVideo = {
	youtubeUrl: string;
	customTitle: string;
	collections?: { label: string; value: string }[];
};

export default function AddVideoForm({ userId }: { userId: string }) {
	// hooks
	const router = useRouter();
	const [showStage2, setShowStage2] = useState(false);
	const YouTubeIdToAdd = useRef("");
	const foundExistingVid = useRef<VideoCardType>(null);
	const collectionOptions = useRef<{ label: string; value: string }[]>([]);

	useEffect(() => {
		getUserCollectionNameIDs(userId).then((options) => {
			collectionOptions.current = options.toSorted();
		});
	}, [userId]); // load/store collection options BTS

	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
	} = useForm<AddVideo>();

	// form submit handler(s)
	const onSubmitYoutubeUrl: SubmitHandler<AddVideo> = async (data) => {
		const ytbId = getYoutubeId(data.youtubeUrl);

		if (ytbId) {
			YouTubeIdToAdd.current = ytbId;
			const existing = await getExistingVideo(userId, ytbId);
			foundExistingVid.current = existing ?? null;
		} else {
			YouTubeIdToAdd.current = "";
		}
		setShowStage2(true);
	};

	const onSubmitToBackend: SubmitHandler<AddVideo> = async (data) => {
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
			router.push(`/videos/${added.videoId}`);
		}
	};

	// ------------------ HTML form ------------------
	return (
		<form
			onSubmit={handleSubmit(
				showStage2 ? onSubmitToBackend : onSubmitYoutubeUrl,
			)}
			className="w-full max-w-2xl mx-auto"
		>
			{!showStage2 && (
				<div className="card bg-base-100 shadow-lg border border-base-200">
					<div className="card-body space-y-6">
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
							<a
								href="/add-video"
								className="btn btn-sm btn-outline btn-error gap-2"
							>
								<RotateCcw size={25} strokeWidth={3} />
								Try Again
							</a>
						</div>
					</div>
				</div>
			)}

			{/* if video already exists for this user, place a Video Card here */}
			{showStage2 && YouTubeIdToAdd.current && foundExistingVid.current && (
				<div className="space-y-4">
					<div className="alert alert-warning shadow-lg">
						<AlertCircle size={24} />
						<div>
							<h3 className="font-bold">Video Already Exists</h3>
							<p className="text-sm">
								You have already added this video to your collection.
							</p>
						</div>
					</div>
					<div className="card bg-base-100 shadow-lg border border-base-200">
						<div className="card-body">
							<VideoCard
								videoId={foundExistingVid.current.videoId}
								youtubeVidID={foundExistingVid.current.youtubeVidID}
								title={foundExistingVid.current.title}
								lastPlayedTime={foundExistingVid.current.lastPlayedTime}
								createdAt={foundExistingVid.current.createdAt}
							/>
						</div>
						<a
							href="/add-video"
							className="btn btn-sm btn-outline btn-error gap-2"
						>
							<Plus size={25} strokeWidth={4} />
							Add Another Video
						</a>
					</div>
				</div>
			)}

			{/* if not existing in user profile*/}
			{showStage2 && YouTubeIdToAdd.current && !foundExistingVid.current && (
				<div className="card bg-base-100 shadow-lg border border-base-200">
					<div className="card-body space-y-6">
						<div className="flex items-center gap-3">
							<Save size={28} className="text-success" />
							<h2 className="card-title text-2xl font-bold">Almost There...</h2>
						</div>

						<div className="form-control w-full">
							<label className="label">
								<span className="label-text font-semibold">
									Custom Video Title
								</span>
							</label>
							<input
								type="text"
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
									/>
								)}
							/>
						</div>

						<button
							className="btn btn-primary w-full gap-2"
							type="submit"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<span className="loading loading-spinner loading-sm"></span>
							) : (
								<Save size={20} />
							)}
							Save Video
						</button>
					</div>
				</div>
			)}
		</form>
	);
}
