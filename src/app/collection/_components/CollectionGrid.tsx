"use client";

import CollectionCard from "./CollectionCard";
import { FolderOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { ArrowDownWideNarrow, ArrowDownNarrowWide } from "lucide-react";

type CollectionInfo = {
	label: string;
	value: string;
	createdAt: Date;
	updatedAt: Date;
	videoNum: number;
};

export default function CollectionGrid({
	userCollectionInfos,
}: {
	userCollectionInfos: CollectionInfo[];
}) {
	// by default, sort by label (name), ascending
	const [sortBy, setSortBy] = useState<string>("name");
	const [asc, setAsc] = useState<boolean>(true);
	const [sortedCollections, setSortedCollections] =
		useState<CollectionInfo[]>(userCollectionInfos);

	// apply the client side sorting of collection folders here
	// depending on sortBy, asc, and collection infos array
	useEffect(() => {
		const sorted = [...userCollectionInfos].sort((a, b) => {
			if (sortBy === "name") {
				return asc
					? a.label.localeCompare(b.label)
					: b.label.localeCompare(a.label);
			}
			if (sortBy === "creation time") {
				return asc
					? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
					: new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			}
			if (sortBy === "last modified time") {
				return asc
					? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
					: new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
			}
			if (sortBy === "number of videos") {
				return asc ? a.videoNum - b.videoNum : b.videoNum - a.videoNum;
			}
			return 0;
		});

		setSortedCollections(sorted);
	}, [sortBy, asc, userCollectionInfos]);

	return (
		<div>
			{/* sorter */}
			<div className="flex items-center justify-end gap-2 mb-4">
				<label
					htmlFor="sort-order"
					className="text-sm font-medium text-base-content/70"
				>
					Sort by
				</label>
				<div className="join">
					<select
						id="sort-order"
						className="select select-sm select-bordered join-item w-44"
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value)}
					>
						<option value="name">Name</option>
						<option value="creation time">Creation Time</option>
						<option value="last modified time">Last Modified Time</option>
						<option value="number of videos">Number of Videos</option>
					</select>
					<button
						type="button"
						className="btn btn-sm btn-square join-item"
						onClick={() => setAsc(!asc)}
						aria-label={asc ? "Sort descending" : "Sort ascending"}
						title={asc ? "Ascending" : "Descending"}
					>
						{asc ? (
							<ArrowDownNarrowWide size={16} />
						) : (
							<ArrowDownWideNarrow size={16} />
						)}
					</button>
				</div>
			</div>
			{/* grid */}
			{sortedCollections.length > 0 ? (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 gap-y-4.5">
					{sortedCollections.map((c) => (
						<CollectionCard
							key={c.value}
							id={c.value}
							name={c.label}
							videoCount={c.videoNum}
						/>
					))}
				</div>
			) : (
				<div className="hero py-16">
					<div className="hero-content flex-col text-center">
						<FolderOpen className="w-20 h-20 text-base-content/30" />
						<h2 className="text-lg font-semibold text-base-content/60">
							No collections yet
						</h2>
					</div>
				</div>
			)}
		</div>
	);
}
