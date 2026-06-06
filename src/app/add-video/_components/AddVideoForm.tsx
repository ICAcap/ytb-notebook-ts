"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { getYoutubeId, YOUTUBE_URL_REGEX } from "../../../../utils/youtube";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import VideoCard from "@/app/videos/_components/VideoCard";

type AddVideo = {
	youtubeUrl: string;
	customTitle: string;
};

export default function AddVideoForm({ userId }: { userId: string }) {
	// hooks
	const [showStage2, setShowStage2] = useState(false);
	const [ytbIdValid, setYtbIdValid] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<AddVideo>();

	// handler
	const onSubmitYoutubeUrl: SubmitHandler<AddVideo> = (data) => {
		const ytbId = getYoutubeId(data.youtubeUrl);
		setShowStage2(true);

		if (ytbId) {
			setYtbIdValid(true);
		} else {
			setYtbIdValid(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmitYoutubeUrl)}>
			<div hidden={showStage2}>
				<label>Youtube URL: </label>
				<input
					type="text"
					className="input"
					{...register("youtubeUrl", {
						required: true,
						maxLength: 255,
						pattern: YOUTUBE_URL_REGEX,
					})}
					title="Paste Valid YouTube Video URL Here"
				/>

				{errors?.youtubeUrl?.type === "required" && (
					<p className="text-error">Youtube Video URL is required</p>
				)}
				{errors?.youtubeUrl?.type === "maxLength" && (
					<p className="text-error">
						Youtube Video URL can not exceed 255 characters
					</p>
				)}
				{errors?.youtubeUrl?.type === "pattern" && (
					<p className="text-error">Not Valid Youtube Video URL</p>
				)}

				<button className="btn btn-primary" type="submit">
					Add Youtube Video
				</button>
			</div>
			{/* if video id not valid */}
			{showStage2 && !ytbIdValid && (
				<div>
					<span>
						Youtube URL uploaded can't render valid video ID, please double
						check and retry
						<a href="/add-video" className="btn btn-accent btn-circle">
							<RotateCcw />
						</a>
					</span>
				</div>
			)}
			{/* if video already exists for this user */}
			<h1>TBD</h1>
			{/* if not existing */}
			<div hidden={!showStage2}>
				<label>Custom Video Title: </label>
				<input
					type="text"
					className="input"
					{...register("customTitle", {
						required: true,
						maxLength: 255,
					})}
					title="Input Custom Title Here"
				/>
				{errors.customTitle?.type === "required" && (
					<p className="text-error">Video Custom Title is required</p>
				)}
				{errors.customTitle?.type === "maxLength" && (
					<p className="text-error">
						Video Custom Title can not exceed 255 characters
					</p>
				)}
			</div>
		</form>
	);
}
