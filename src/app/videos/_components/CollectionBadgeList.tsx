"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CollectionOptions } from "../../../../lib/dbTableAction/collectionTableActions";

export default function CollectionBadgeList({
	collections,
}: {
	collections: CollectionOptions;
}) {
	const searchParams = useSearchParams();
	const collectionSorted = collections.toSorted((c1, c2) =>
		c1.label.localeCompare(c2.label),
	);

	return (
		<div className="flex flex-wrap gap-1 mt-1">
			{collectionSorted.map((collection, index) => {
				const isActive = collection.label === searchParams.get("collection");
				return (
					<Link
						key={index}
						href={
							"/videos?" +
							new URLSearchParams({
								collection: collection.label,
							}).toString()
						}
						className={`btn btn-xs btn-accent hover:border hover:border-accent-content transition-all rounded-full ${isActive ? "btn-disabled pointer-events-none" : ""}`}
					>
						{collection.label}
					</Link>
				);
			})}
		</div>
	);
}
