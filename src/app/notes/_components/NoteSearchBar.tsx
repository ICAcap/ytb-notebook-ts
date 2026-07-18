"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Select from "react-select";
import { FolderBookmark, Palette, Search } from "lucide-react";
import { SubmitEvent } from "react";
import { NOTE_COLORS } from "../../../../utils/noteColors";

type CollectionFilterOption = {
	label: string;
	value: string;
	videoNum: number;
};

type ColorOption = {
	label: string;
	value: string;
};

const formatColorOptionLabel = ({ label, value }: ColorOption) => (
	<div className="flex items-center gap-2">
		<span style={{ color: value }}>{label}</span>
	</div>
);

//////// React Component ///////

const NoteSearchBar = ({
	collections,
}: {
	collections: CollectionFilterOption[];
}) => {
	// get existing search params data
	const searchParams = useSearchParams();
	const existingQuery = searchParams.get("query");
	const existingCollectionFilters = searchParams.get("collection");
	const existingColorFilters = searchParams.get("color");

	//hooks
	const [inputQuery, setInputQuery] = useState<string>(existingQuery ?? "");
	const [collectionFilterApplied, setCollectionFilterApplied] = useState<
		CollectionFilterOption[]
	>(() => {
		return existingCollectionFilters
			? collections.filter((c) =>
					existingCollectionFilters.split(",").includes(c.value),
				)
			: [];
	});
	const [colorFilterApplied, setColorFilterApplied] = useState<
		{ label: string; value: string }[]
	>(() => {
		return existingColorFilters
			? NOTE_COLORS.filter((nc) =>
					existingColorFilters.split(",").includes(nc.value),
				)
			: [];
	});
	const router = useRouter();

	// form submit handler
	function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
		e.preventDefault();
		const query = inputQuery.trim().toLowerCase();
		const searchParam = new URLSearchParams({
			query,
			collection: collectionFilterApplied.map((c) => c.value).join(","), // pass collection filters by collection id, joined by ","
			color: colorFilterApplied.map((c) => c.value).join(","), // by hex, joined by ","
		});
		router.push(`/notes?${searchParam}`);
		(
			document.getElementById("note-search-bar-input") as HTMLInputElement
		).blur(); //un-focus input field
	}

	return (
		<div className="flex flex-col gap-2">
			{/* input bar */}
			<form
				onSubmit={handleSubmit}
				className="flex flex-row items-center gap-2"
			>
				<Search className="h-5 w-5 shrink-0 text-base-content/70" />
				<input
					id="note-search-bar-input"
					name="query"
					type="search"
					onChange={(e) => setInputQuery(e.target.value)}
					placeholder="Type Note Content to Search..."
					defaultValue={inputQuery}
					className="input input-xl input-bordered flex-1 focus:outline-none"
				/>
				<button type="submit" className="btn btn-info btn-lg">
					Search
				</button>
			</form>
			{/* collection filters */}
			<div className="flex flex-row items-center gap-2">
				<FolderBookmark className="h-5 w-5 shrink-0 text-base-content/70" />
				<Select
					instanceId="collection-filter-select"
					options={collections}
					isMulti
					isSearchable
					onChange={(e) => setCollectionFilterApplied(e.flat())}
					placeholder="Filter by Non-Empty Collections"
					defaultValue={collectionFilterApplied}
					classNamePrefix="react-select"
					className="w-full text-black"
				/>
			</div>
			{/* color tag filters */}
			<div className="flex flex-row items-center gap-2">
				<Palette className="h-5 w-5 shrink-0 text-base-content/70" />
				<Select
					instanceId="color-filter-select"
					options={NOTE_COLORS}
					formatOptionLabel={formatColorOptionLabel}
					isMulti
					isSearchable
					onChange={(e) => setColorFilterApplied(e.flat())}
					placeholder="Filter by Note Color Tags"
					defaultValue={colorFilterApplied}
					classNamePrefix="react-select"
					className="w-full text-black"
				/>
			</div>
			<br />
		</div>
	);
};
export default NoteSearchBar;
