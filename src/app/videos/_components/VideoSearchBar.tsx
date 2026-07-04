"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { SubmitEvent } from "react";

type Props = {
	q?: string;
};
const VideoSearchBar = ({ q }: Props) => {
	const router = useRouter();

	// submitting query handlers
	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const query = (formData.get("q") as string).trim().toLowerCase() ?? "";
		const searchParam = new URLSearchParams({ q: query });
		router.push(`/videos?${searchParam}`);
	};

	return (
		<div className="mb-8" title="Search Video Title">
			{/* Search bar */}
			<form className="join w-full" onSubmit={handleSubmit}>
				<input
					id="vid-search-bar-input"
					name="q"
					defaultValue={q}
					placeholder="Search Video Title..."
					className="join-item input input-bordered flex-1 focus:outline-none"
				/>
				<button type="submit" className="join-item btn btn-primary">
					Search
				</button>
				{q && (
					<button
						type="button"
						onClick={() => {
							(
								document.getElementById(
									"vid-search-bar-input",
								) as HTMLInputElement
							).value = "";
							router.push("/videos");
						}}
						className="join-item btn btn-square btn-error btn-ghost"
						title="Clear search"
					>
						<X size={25} strokeWidth={3} />
					</button>
				)}
			</form>
		</div>
	);
};

export default VideoSearchBar;
