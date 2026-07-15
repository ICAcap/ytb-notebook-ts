"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Select, { StylesConfig } from "react-select";
import { FolderBookmark, Palette } from "lucide-react";
import { SubmitEvent } from "react";
import { NOTE_COLORS } from "../../../../utils/noteColors";

type collectionFilterOption = {
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

// Layout-only overrides so the dot isn't clipped by react-select's default
// multiValue container (overflow: hidden, no flex alignment)
const colorSelectStyles: StylesConfig<ColorOption, true> = {
	multiValue: (styles) => ({
		...styles,
		display: "flex",
		alignItems: "center",
		overflow: "visible",
	}),
	multiValueLabel: (styles) => ({
		...styles,
		display: "flex",
		alignItems: "center",
		overflow: "visible",
	}),
};

//////// React Component ///////

const NoteSearchBar = ({
	collections,
}: {
	collections: collectionFilterOption[];
}) => {
	//hooks
	const [inputQ, setInputQ] = useState<string>("");
	const [collectionFilterApplied, setCollectionFilterApplied] = useState<
		collectionFilterOption[]
	>([]);
	const [colorFilterApplied, setColorFilterApplied] = useState<
		{ label: string; value: string }[]
	>([]);
	const router = useRouter();

	// form submit handler
	function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
		e.preventDefault();
		const query = inputQ.trim().toLowerCase();
		const searchParam = new URLSearchParams({
			q: query,
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
			<form onSubmit={handleSubmit} className="flex flex-row gap-1">
				<input
					id="note-search-bar-input"
					name="query"
					type="search"
					onChange={(e) => setInputQ(e.target.value)}
					placeholder="Type Note Content to Search..."
					className="input w-full"
				/>
				<button type="submit" className="btn btn-info">
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
					placeholder="Filter by Collection(s) with Videos Present..."
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
					styles={colorSelectStyles}
					isMulti
					isSearchable
					onChange={(e) => setColorFilterApplied(e.flat())}
					placeholder="Filter by Note Color Tag(s)..."
					classNamePrefix="react-select"
					className="w-full text-black"
				/>
			</div>
			<br />
		</div>
	);
};
export default NoteSearchBar;
