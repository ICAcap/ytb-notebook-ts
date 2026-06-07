"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { getYoutubeId, YOUTUBE_URL_REGEX } from "../../../../utils/youtube";
import { useState, useRef } from "react";
import { RotateCcw, AlertCircle } from "lucide-react";
import { getExistingVideo } from "../../../../lib/dbTableAction/videoTableAction";
import VideoCard from "@/app/videos/_components/VideoCard";
import { VideoCardType } from "../../../../lib/dbTableAction/videoTableAction";

type AddVideo = {
	youtubeUrl: string;
	customTitle: string;
};

export default function AddVideoForm({ userId }: { userId: string }) {
	// hooks
	const [showStage2, setShowStage2] = useState(false);
	const ytbIdValid = useRef(false);
	const foundExistingVid = useRef<VideoCardType>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<AddVideo>();

	// handler
	const onSubmitYoutubeUrl: SubmitHandler<AddVideo> = async (data) => {
		const ytbId = getYoutubeId(data.youtubeUrl);

		if (ytbId) {
			setShowStage2(true);
			ytbIdValid.current = true;
			const existing = await getExistingVideo(userId, ytbId);

			if (existing) {
				foundExistingVid.current = existing;
			} else {
				foundExistingVid.current = null;
			}
			setShowStage2((prev) => !prev);
			setShowStage2(true);
		} else {
			setShowStage2(true);
			ytbIdValid.current = false;
		}
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmitYoutubeUrl)}
			className="w-full max-w-2xl mx-auto"
		>
			{!showStage2 && (
				<div className="card bg-base-100 shadow-lg border border-base-200">
					<div className="card-body space-y-6">
						<h2 className="card-title text-2xl font-bold">Add YouTube Video</h2>

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
							className="btn btn-primary w-full"
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
			{showStage2 && !ytbIdValid.current && (
				<div className="card bg-error/10 border-2 border-error shadow-md">
					<div className="card-body">
						<div className="flex items-start gap-4">
							<AlertCircle className="text-error shrink-0 mt-1" size={24} />
							<div>
								<h3 className="font-bold text-error mb-2">
									Invalid YouTube URL
								</h3>
								<p className="text-sm text-base-content">
									The YouTube URL you provided cannot render a valid video ID.
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
			{showStage2 && ytbIdValid.current && foundExistingVid.current && (
				<div className="space-y-4">
					<div className="alert alert-warning shadow-md">
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
							<RotateCcw size={25} strokeWidth={3} />
							Try Again
						</a>
					</div>
				</div>
			)}

			{/* if not existing */}
			{showStage2 && ytbIdValid.current && !foundExistingVid.current && (
				<div className="card bg-base-100 shadow-lg border border-base-200">
					<div className="card-body space-y-6">
						<h2 className="card-title text-2xl font-bold">Enter Video Title</h2>

						<div className="form-control w-full">
							<label className="label">
								<span className="label-text font-semibold">
									Custom Video Title
								</span>
							</label>
							<input
								type="text"
								placeholder="My awesome video title..."
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

						<button
							className="btn btn-primary w-full"
							type="submit"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<span className="loading loading-spinner loading-sm"></span>
							) : null}
							Save Video
						</button>
					</div>
				</div>
			)}
		</form>
	);
}
