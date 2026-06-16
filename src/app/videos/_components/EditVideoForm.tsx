"use client";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { AlertCircle, FolderBookmark, Pencil, Save } from "lucide-react";
import { upsertYouTubeVideo } from "../../../../lib/dbTableAction/videoTableAction";
import {
	CollectionOptions,
	getUserCollectionNameIDs,
} from "../../../../lib/dbTableAction/collectionTableActions";
import { useEffect, Dispatch, SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";

// video edit type for react hook form
type EditVideo = {
	customTitle: string;
	collections?: CollectionOptions;
};

const EditVideoForm = ({
	modalOpen,
	setModalOpen,
	userId,
	youtubeVideoId,
	oldTitle,
	oldCollections,
}: {
	modalOpen: boolean;
	setModalOpen: Dispatch<SetStateAction<boolean>>;
	userId: string;
	youtubeVideoId: string;
	oldTitle: string;
	oldCollections: CollectionOptions;
}) => {
	const [collectionOptions, setCollectionOptions] = useState<
		{ label: string; value: string }[]
	>([]);
	const router = useRouter();
	useEffect(() => {
		if (modalOpen) {
			getUserCollectionNameIDs(userId).then((options) => {
				setCollectionOptions(
					options.toSorted((a, b) => a.label.localeCompare(b.label)),
				);
			});
		}
	}, [userId, modalOpen]); // load/store collection options BTS

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<EditVideo>();

	useEffect(() => {
		!modalOpen && reset();
	}, [modalOpen]);

	// form submit handler(s)
	const onSubmitVideoEdit: SubmitHandler<EditVideo> = async (data) => {
		const editedCollectionIds = data.collections
			? data.collections.map((c) => c.value)
			: [];
		const editedVideoTitle = data.customTitle;

		const edition = await upsertYouTubeVideo(
			userId,
			youtubeVideoId,
			editedVideoTitle,
			editedCollectionIds,
		);
		if (edition) {
			// success
			setModalOpen(false);
			router.refresh();
			toast.success("Video Edition Successful", {
				id: "video-edition-failed",
			});
		} else {
			toast.error("Video Edition Failed, Please Try Again Later", {
				id: "video-edition-failed",
			});
		}
	};

	return (
		<div className="flex flex-col gap-10">
			<header>
				<h1 className="text-2xl font-semibold text-center">Edit Video</h1>
			</header>
			<form onSubmit={handleSubmit(onSubmitVideoEdit)} className="flex flex-col gap-8">
				<div>
					<label className="label">
						<span className="label-text font-semibold my-0.5">
							Custom Video Title
						</span>
					</label>
					<input
						type="text"
						defaultValue={oldTitle}
						placeholder="My Awesome Custom Video Title..."
						className={`input input-bordered w-full ${
							errors?.customTitle ? "input-error" : ""
						}`}
						{...register("customTitle", {
							required: true,
							maxLength: 255,
						})}
						title="Input Custom Title Here"
						autoFocus
					/>
					{errors.customTitle && (
						<div className="label mt-1">
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
							Collection(s)
						</span>
						<span className="label-text-alt text-xs opacity-70">Optional</span>
					</label>
					<Controller
						name="collections"
						control={control}
						defaultValue={oldCollections}
						render={({ field }) => (
							<Select
								{...field}
								isMulti
								isSearchable
								options={collectionOptions}
								placeholder="Select Collection(s)..."
								classNamePrefix="react-select"
								className="text-black"
							/>
						)}
					/>
				</div>
				<button
					className="btn btn-accent w-full mt-2"
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
			</form>
		</div>
	);
};

export default EditVideoForm;
