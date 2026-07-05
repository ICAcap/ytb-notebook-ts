"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FunnelX } from "lucide-react";
import Link from "next/link";
import { SubmitEvent } from "react";
import Fuse from "fuse.js";

const _ = require("lodash"); // for debounce purpose

type Props = {
	unqVidTitles: string[];
	q?: string;
};
// component
const VideoSearchBar = ({ unqVidTitles, q }: Props) => {
	const [vidSuggestion, setVidSuggestion] = useState<string[]>([]);
	const [showSuggestion, setShowSuggestion] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const fuse = useMemo(
		() =>
			new Fuse(unqVidTitles, {
				threshold: 0.3,
			}),
		[unqVidTitles],
	);

	// debounce on keystrokes
	const handleSearchVidSuggest = useRef(
		_.debounce((query: string) => {
			const cleanedQuery = query.trim().toLowerCase();
			if (!cleanedQuery) {
				setVidSuggestion([]);
				setShowSuggestion(false);
				return;
			}

			const topMatches = fuse
				.search(cleanedQuery, { limit: 15 })
				.map((result) => result.item);
			setVidSuggestion(topMatches);
			setShowSuggestion(topMatches.length > 0);
		}, 250), // Delay execution to avoid excessive re-renders during typing.
	);

	// cancel any pending debounced search if the component unmounts mid-type
	useEffect(() => {
		return () => handleSearchVidSuggest.current.cancel();
	}, []);

	// close the dropdown on outside click; mousedown (not click) so it fires
	// before a click on a suggestion would otherwise blur the input first
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) {
				setShowSuggestion(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// submitting query handlers (cached)
	const handleSubmit = useCallback(
		(e: SubmitEvent<HTMLFormElement>) => {
			e.preventDefault();
			const formData = new FormData(e.currentTarget);
			const query =
				(formData.get("query") as string).trim().toLowerCase() ?? "";
			const searchParam = new URLSearchParams({ q: query });
			setShowSuggestion(false);
			router.push(`/videos?${searchParam}`);
			(
				document.getElementById("vid-search-bar-input") as HTMLInputElement
			).blur(); //un-focus input field
		},
		[router],
	);

	return (
		<div
			className="dropdown mb-8 w-full"
			ref={containerRef}
			title="Search Video Title"
		>
			{/* Search bar */}
			<form className="join w-full" onSubmit={handleSubmit}>
				<input
					id="vid-search-bar-input"
					name="query"
					type="search"
					defaultValue={q}
					placeholder="Search Video Title..."
					autoComplete="off"
					onChange={(e) => handleSearchVidSuggest.current(e.target.value)}
					onFocus={() => {
						if (vidSuggestion.length > 0) setShowSuggestion(true);
					}}
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
							setVidSuggestion([]);
							setShowSuggestion(false);
							router.push("/videos");
						}}
						className="join-item btn btn-square btn-error btn-ghost"
						title="Clear Filter"
					>
						<FunnelX size={25} />
					</button>
				)}
			</form>
			{/* show suggestions if there are any */}
			{vidSuggestion.length > 0 && showSuggestion && (
				<ul className="menu dropdown-content bg-base-300 rounded-box z-999 w-full p-1 shadow-sm">
					{vidSuggestion.map((vid, idx) => (
						<li
							key={idx}
							onClick={() => {
								setShowSuggestion(false);
								(
									document.getElementById(
										"vid-search-bar-input",
									) as HTMLInputElement
								).value = vid;
							}}
						>
							<Link href={`/videos?${new URLSearchParams({ q: vid })}`}>
								{vid}
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default VideoSearchBar;
