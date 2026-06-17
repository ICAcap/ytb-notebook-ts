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
			{collectionSorted.map((collection, index) => (
				// click the collection badge to jump to other videos that are all the same collection
				// except the collection view we are currently landed on
				<button
					key={index}
					disabled={collection.label === searchParams.get("collection")}
					className={`btn btn-xs btn-accent rounded-full ${collection.label === searchParams.get("collection") ? "btn-disabled" : ""}`}
				>
					<Link
						href={
							"/videos?" +
							new URLSearchParams({
								collection: collection.label,
							}).toString()
						}
					>
						{collection.label}
					</Link>
				</button>
			))}
		</div>
	);
}
