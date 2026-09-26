"use client";

import { useState } from "react";
import Link from "next/link";
import { History } from "lucide-react";

type Props = { videoId: string; title: string };

export default function RecentWatched({ vids }: { vids: Props[] }) {
	const [loadMore, setLoadMore] = useState<boolean>(false);

	return (
		<div className="card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">
				<h1 className="card-title gap-2">
					<History size={30} />
					Recently Watched
				</h1>
				{vids.length === 0 ? (
					<p className="text-base-content/60 text-lg">
						Videos you watched recently will show up here.
					</p>
				) : (
					<div>
						<ul className="divide-y divide-base-200">
							{vids.slice(0, loadMore ? vids.length : 5).map((video) => (
								<li key={video.videoId}>
									<Link
										href={`/videos/${video.videoId}`}
										title={video.title}
										className="block py-2 hover:text-primary text-base sm:text-lg transition-colors truncate"
									>
										{video.title}
									</Link>
								</li>
							))}
						</ul>
						<div className="flex justify-end pt-1 transition-all">
							<button
								onClick={() => setLoadMore(!loadMore)}
								hidden={vids.length <= 5}
								className="btn btn-sm sm:btn-lg"
							>
								{loadMore ? "Show Fewer" : "Show More"}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
