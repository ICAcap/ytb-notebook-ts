"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import Select from "react-select";
import { Collection } from "../../../../generated/prisma";
import {
	getNoteSearchCount,
	getNotesWithSearchParam,
} from "../../../../lib/dbTableAction/noteTableAction";

type collectionFilterOption = {
	label: string;
	value: string;
	videoNum: number;
};

const NoteSearchBar = ({
	collections,
}: {
	collections: collectionFilterOption[];
}) => {
	//hooks
	const [collectionFilterOptionApplied, setCollectionFilterOptionApplied] =
		useState<collectionFilterOption[]>([]);

	return (
		<div>
			<input
				type="text"
				placeholder="Type Note Content to Search..."
				className="input w-full"
			/>
			<Select
				options={collections}
				isMulti
				isSearchable
				placeholder="Filter by Collection(s)..."
				classNamePrefix="react-select"
				className="text-black"
			/>
		</div>
	);
};
export default NoteSearchBar;
