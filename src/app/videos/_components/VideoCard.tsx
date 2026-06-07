import { getThumbnailUrl } from "../../../../utils/youtube";
import { formatTimeStamp } from "../../../../utils/formatTimeStamp";
import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Pencil } from "lucide-react";
import { Suspense } from "react";
import { VideoCardType } from "../../../../lib/dbTableAction/videoTableAction";

export default memo(function VideoCard({
	videoId,
	youtubeVidID,
	title,
	lastPlayedTime,
	createdAt,
}: VideoCardType) {
	const thumbnailUrl = youtubeVidID ? getThumbnailUrl(youtubeVidID) : null;

	return (
		<>
			{/* Thumbnail Frame */}
			<div className="relative hover-3d cursor-pointer">
				<Link href={`/videos/${videoId}`} className="link">
					<Suspense fallback={<div className="w-24 h-14 bg-gray-200" />}>
						{thumbnailUrl ? (
							<Image
								src={thumbnailUrl}
								alt={title}
								width={200}
								height={113}
								className="w-full h-full"
								loading="eager"
							/>
						) : (
							<div className="w-full h-full">
								<span className="text-xs font-semibold text-gray-600">?</span>
							</div>
						)}
					</Suspense>
				</Link>
				{/* 8 empty divs needed for the 3D effect */}
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
			</div>

			{/* Details */}
			<div className="list-col-grow">
				<Link
					href={`/videos/${videoId}`}
					className="font-semibold text-base hover:text-primary transition-colors duration-150 line-clamp-2"
				>
					{title}
				</Link>
				<div className="text-xs font-medium text-base-content/60 mt-1">
					Last Watched: {formatTimeStamp(lastPlayedTime)}
				</div>
				<div className="text-xs text-base-content/50 mt-0.5">
					Added: {createdAt.toLocaleDateString()}
				</div>
			</div>

			{/* Actions */}
			<div className="flex gap-2">
				<button
					title="Delete Video"
					className="btn btn-ghost btn-sm"
				>
					<Trash2 className="w-5 h-5 text-error" />
				</button>
				<button
					title="Edit Video"
					className="btn btn-ghost btn-sm"
				>
					<Pencil className="w-5 h-5 text-info" />
				</button>
			</div>
		</>
	);
});
