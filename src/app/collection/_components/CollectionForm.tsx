"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
	createCollection,
	getUserCollectionByName,
	updateCollection,
} from "../../../../lib/dbTableAction/collectionTableActions";
import { AlertCircle } from "lucide-react";

// for react hook form type definition and form validation
type UpsertCollection = {
	collectionTitle: string;
};

// component for both adding new collection and editing existing collection (upsert)
export default function CollectionForm({
	userId,
	collectionID,
	existingTitle,
}: {
	userId: string;
	collectionID?: string;
	existingTitle?: string;
}) {
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const {
		register,
		handleSubmit,
		setError,
		reset,
		clearErrors,
		formState: { errors, isSubmitting },
	} = useForm<UpsertCollection>();

	const onSubmitToBackend: SubmitHandler<UpsertCollection> = async (data) => {
		clearErrors("root"); // Reset root errors to prevent stale messages from previous attempts.
		const name = data.collectionTitle;

		// no matter edit or adding, check dup on edited/new collection name first
		const dupCollection = await getUserCollectionByName(userId, name);
		if (dupCollection) {
			setError("root", {
				type: "duplicate",
				message: `"${name}" already exists. Choose a different name.`,
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
				setSubmitSuccess(true);

				// force F5 reload
				// reference: https://medium.com/@devdo/how-to-force-a-page-refresh-in-next-js-6326cae49fe4
				setTimeout(() => {
					window.location.reload();
				}, 1000);
			}
			//failure
			else {
				setError("root", {
					type: "serverError",
					message: "Failed to create collection. Please try again.",
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
				reset();
				setSubmitSuccess(true);
				setTimeout(() => {
					window.location.reload();
				}, 1000);
			} else {
				setError("root", {
					type: "serverError",
					message: "Failed to update collection. Please try again.",
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
						disabled={isSubmitting || submitSuccess}
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
					disabled={isSubmitting || submitSuccess} // Prevent double-submissions while the server action is processing.
				>
					{isSubmitting ? (
						<span className="loading loading-spinner loading-sm"></span>
					) : null}
					{collectionID ? "Update Collection" : "Add Collection"}
				</button>

				{errors.root?.type === "duplicate" && (
					<div role="alert" className="alert alert-warning mt-4">
						<AlertCircle size={16} />
						<span>{errors.root.message}</span>
					</div>
				)}
				{errors.root?.type === "serverError" && (
					<div role="alert" className="alert alert-error mt-4">
						<AlertCircle size={16} />
						<span>{errors.root.message}</span>
					</div>
				)}
				{submitSuccess && (
					<div role="alert" className="alert alert-success mt-4">
						<span>
							Collection {collectionID ? "updated" : "created"} successfully!
						</span>
					</div>
				)}
			</form>
		</div>
	);
}
