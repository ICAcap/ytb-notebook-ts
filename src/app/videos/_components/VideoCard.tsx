import { url } from "inspector";
import { getYoutubeId, getThumbnailUrl } from "../../../../utils/youtube";
import { formatTimeStamp } from "../../../../utils/formatTimeStamp";
import Image from "next/image";

export default function VideoCard({
	videoUrl,
	title,
	timestamp,
}: {
	videoUrl: string;
	title: string;
	timestamp: number;
}) {
	const youtubeId = getYoutubeId(videoUrl);
	const thumbnailUrl = youtubeId
		? getThumbnailUrl(youtubeId)
		: getThumbnailUrl("-----------");

	return (
		<div className="flex gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors group">
			{/* Thumbnail Container */}
			<div className="relative w-40 h-24 shrink-0 overflow-hidden rounded-lg bg-gray-200">
				<Image
					src={thumbnailUrl}
					alt={title}
					fill
					sizes="(max-width: 768px) 160px, 160px"
					className="object-cover group-hover:scale-105 transition-transform duration-200"
					loading="lazy" // Native lazy loading
				/>
			</div>

			{/* Details */}
			<div className="flex flex-col justify-center overflow-hidden">
				<h3 className="text-sm font-medium line-clamp-2 leading-tight">
					{title}
				</h3>
				<p className="text-xs text-gray-500 mt-1">
					Last Watched: {formatTimeStamp(timestamp)}
				</p>
			</div>
		</div>
	);
}
