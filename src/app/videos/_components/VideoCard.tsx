import { getYoutubeId, getThumbnailUrl } from "../../../../utils/youtube";
import { formatTimeStamp } from "../../../../utils/formatTimeStamp";
import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Pencil } from "lucide-react";
import { Suspense } from "react";
import { VideoCardType } from "../page";

export default memo(function VideoCard({
	videoId,
	url,
	title,
	lastPlayedTime,
	createdAt,
}: VideoCardType) {
	const youtubeId = getYoutubeId(url);
	const thumbnailUrl = youtubeId ? getThumbnailUrl(youtubeId) : null;

	return (
		<>
			{/* Thumbnail Frame */}
			<div className="relative">
				<Link
					href={`/videos/${videoId}`}
					className="relative block group overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100 shadow-md hover:shadow-lg hover:border-gray-400 transition-all duration-200"
				>
					<Suspense fallback={<div className="w-24 h-14 bg-gray-200" />}>
						{thumbnailUrl ? (
							<Image
								src={thumbnailUrl}
								alt={title}
								width={200}
								height={113}
								className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
								loading="lazy"
							/>
						) : (
							<div className="w-full h-full bg-gray-300 flex items-center justify-center">
								<span className="text-xs font-semibold text-gray-600">?</span>
							</div>
						)}
					</Suspense>
				</Link>
			</div>

			{/* Details */}
			<div className="list-col-grow">
				<Link
					href={`/videos/${videoId}`}
					className="font-semibold text-base hover:text-blue-600 transition-colors duration-150 line-clamp-2"
				>
					{title}
				</Link>
				<div className="text-xs font-medium text-gray-600 mt-1">
					Last Watched: {formatTimeStamp(lastPlayedTime)}
				</div>
				<div className="text-xs text-gray-500 mt-0.5">
					Added: {createdAt.toLocaleDateString()}
				</div>
			</div>

			{/* Actions */}
			<div className="flex gap-2">
				<button
					title="Delete Video"
					className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-150"
				>
					<Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" />
				</button>
				<button
					title="Edit Video"
					className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-150"
				>
					<Pencil className="w-5 h-5 text-blue-500 hover:text-blue-700" />
				</button>
			</div>
		</>
	);
});
