import { getYoutubeId, getThumbnailUrl } from "../../../../utils/youtube";
import { formatTimeStamp } from "../../../../utils/formatTimeStamp";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Pencil, ImageDown } from "lucide-react";
import { Suspense } from "react";

interface VideoCardProps {
	videoId: string;
	videoUrl: string;
	title: string;
	timestamp: number;
}

export default function VideoCard({
	videoId,
	videoUrl,
	title,
	timestamp,
}: VideoCardProps) {
	const youtubeId = getYoutubeId(videoUrl);
	const thumbnailUrl = youtubeId ? getThumbnailUrl(youtubeId) : null;

	return (
		<div className="flex gap-3 p-2 m-2 shadow-md rounded-lg group">
			{/* Thumbnail Container */}
			<Link
				href={`/videos/${videoId}`}
				className="relative w-40 h-24 shrink-0 overflow-hidden rounded-lg bg-gray-200"
			>
				<Suspense fallback={<ImageDown size={100} />}>
					{thumbnailUrl ? (
						<Image
							src={thumbnailUrl}
							alt={title}
							fill
							sizes="(max-width: 768px) 160px, 160px"
							className="object-cover cursor-pointer group-hover:scale-105 transition-transform duration-200"
							loading="lazy"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center p-2">
							<p className="text-sm text-gray-500">No thumbnail available</p>
						</div>
					)}
				</Suspense>
			</Link>

			{/* Details */}
			<div className="flex flex-col justify-center overflow-hidden">
				<Link
					href={`/videos/${videoId}`}
					className="text-shadow-mauve-100 text-2xl font-medium cursor-pointer line-clamp-2 leading-tight"
				>
					{title}
				</Link>
				<p className="text-xs mt-1">
					Last Watched - {formatTimeStamp(timestamp)}
				</p>
				<div className="py-3 right-2 flex">
					<button title="Delete Video">
						<Trash2 className="w-6 h-6 cursor-pointer text-red-400 hover:text-red-700" />
					</button>
					<button title="Edit Video Properties">
						<Pencil className="w-6 h-6 cursor-pointer text-red-400 hover:text-red-700 ml-2" />
					</button>
				</div>
			</div>
		</div>
	);
}
