"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { BrushCleaning, Search } from "lucide-react";
import CreatableSelect from "react-select/creatable";

type Props = {
	unqVidTitles: string[];
	query?: string;
	currentCollection?: string;
};

type TitleOption = {
	label: string;
	value: string;
};

// component - react-select handles matching & lets users type a new query
const VideoSearchBar = ({ unqVidTitles, query, currentCollection }: Props) => {
	const router = useRouter();

	const options: TitleOption[] = useMemo(
		() =>
			unqVidTitles.toSorted().map((title) => ({ label: title, value: title })),
		[unqVidTitles],
	);

	const currentValue: TitleOption | null = query
		? { label: query, value: query }
		: null;

	const handleChange = (option: TitleOption | null) => {
		const searchParam = new URLSearchParams({
			query: (option?.value ?? "").trim().toLowerCase(),
		});
		router.push(`/videos?${searchParam}`);
	};

	return (
		<div
			className="mb-8 flex w-full items-center gap-2"
			title="Search Video Title"
		>
			<Search className="h-5 w-5 shrink-0 text-base-content/70" />
			<div className="flex flex-1 items-center gap-2">
				<CreatableSelect<TitleOption, false>
					instanceId="vid-search-bar-select"
					options={options}
					value={currentValue}
					onChange={(option) => handleChange(option)}
					onCreateOption={(inputValue) =>
						handleChange({ label: inputValue, value: inputValue })
					}
					placeholder="Search or type a video title..."
					classNamePrefix="react-select"
					className="flex-1 text-black"
					createOptionPosition="first"
					formatCreateLabel={(inputValue) => `Search for "${inputValue}"`}
				/>
				{(query || currentCollection) && (
					<button
						type="button"
						onClick={() => {
							router.push("/videos");
						}}
						className="btn btn-square btn-error btn-ghost"
						title="Clear Filter"
					>
						<BrushCleaning size={25} />
					</button>
				)}
			</div>
		</div>
	);
};

export default VideoSearchBar;
