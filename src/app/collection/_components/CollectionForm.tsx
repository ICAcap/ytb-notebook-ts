"use client";

import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import {
	createCollection,
	getUserCollectionByName,
	updateCollection,
} from "../../../../lib/dbTableAction/collectionTableActions";
import { AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

// for react hook form type definition and form validation
type UpsertCollection = {
	collectionTitle: string;
};

// component for both adding new collection and editing existing collection (upsert)
export default function CollectionForm({
	userId,
	collectionID,
	existingTitle,
	setAddModalOpen,
	setPencilModalOpen,
}: {
	userId: string;
	collectionID?: string;
	existingTitle?: string;
	setAddModalOpen?: Dispatch<SetStateAction<boolean>>;
	setPencilModalOpen?: Dispatch<SetStateAction<boolean>>;
}) {
	const router = useRouter();
	const {
		register,
		handleSubmit,
		setError,
		reset,
		clearErrors,
		formState: { errors, isSubmitting },
	} = useForm<UpsertCollection>({
		defaultValues: { collectionTitle: existingTitle ?? "" },
	});

	const onSubmitToBackend: SubmitHandler<UpsertCollection> = async (data) => {
		clearErrors("root");
		const name = data.collectionTitle;

		// no matter edit or adding, check dup on edited/new collection name first
		const dupCollection = await getUserCollectionByName(userId, name);
		if (dupCollection) {
			setError("root", {
				type: "duplicate",
				message: `"${name}" already exists. Choose a different name.`,
			});
			toast.error(`"${name}" already exists. Choose a different name.`, {
				id: "collection-form-toast",
			});
			return; // Stop submission
		}

		// adding new collection
		if (!collectionID) {
			const addCollection = await createCollection({
				collectionName: name,
				userId: userId,
			});

			//success
			if (addCollection) {
				reset(); // Clear the form input after successful submission.
				toast.success("Collection created successfully!", {
					id: "collection-form-toast",
				});
				router.refresh();
				setAddModalOpen && setAddModalOpen(false);
			}
			//failure
			else {
				setError("root", {
					type: "serverError",
					message: "Failed to create collection. Please try again.",
				});
				toast.error("Failed to create collection. Please try again.", {
					id: "collection-form-toast",
				});
			}
		}

		// editing existing collection
		else {
			const updateCollectionResult = await updateCollection({
				collectionId: collectionID,
				collectionName: name,
			});

			if (updateCollectionResult) {
				toast.success("Collection updated successfully!", {
					id: "collection-form-toast",
				});
				router.refresh();
				setPencilModalOpen && setPencilModalOpen(false);
			} else {
				setError("root", {
					type: "serverError",
					message: "Failed to update collection. Please try again.",
				});
				toast.error("Failed to update collection. Please try again.", {
					id: "collection-form-toast",
				});
			}
		}
	};

	return (
		<div>
			<header>
				<h1 className="text-2xl font-semibold text-center">Collection</h1>
			</header>
			<form onSubmit={handleSubmit(onSubmitToBackend)}>
				<div className="my-2">
					<label className="label">
						<span className="label-text font-semibold my-0.5">
							Collection Name
						</span>
					</label>
					<input
						disabled={isSubmitting}
						type="text"
						placeholder="My Awesome Collection"
						defaultValue={existingTitle || ""} // Pre-fill the input with the existing collection name when editing.
						className={`input input-bordered w-full ${
							errors?.collectionTitle ? "input-error" : ""
						}`}
						{...register("collectionTitle", {
							required: true,
							maxLength: 255, // Match the database schema constraint for the collection name.
						})}
						title="Input New Collection Name Here"
						autoFocus
					/>
					{errors?.collectionTitle && (
						<div className="label mt-2">
							<span className="label-text-alt text-error flex items-center gap-2">
								<AlertCircle size={16} />
								{errors?.collectionTitle?.type === "required" &&
									"Collection Name is required"}
								{errors?.collectionTitle?.type === "maxLength" &&
									"Collection Name cannot exceed 255 characters"}
							</span>
						</div>
					)}
				</div>

				<button
					className="btn btn-accent w-full"
					type="submit"
					disabled={isSubmitting} // Prevent double-submissions while the server action is processing.
				>
					{isSubmitting ? (
						<span className="loading loading-spinner loading-sm"></span>
					) : null}
					{collectionID ? "Update Collection" : "Add Collection"}
				</button>
			</form>
		</div>
	);
}
