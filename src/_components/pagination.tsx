//reference:
//https://github.com/machadop1407/NextJS-inventory-management-app/blob/main/components/pagination.tsx

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	baseUrl: string;
	searchParams: Record<string, string>;
}

export default function Pagination({
	currentPage,
	totalPages,
	baseUrl,
	searchParams,
}: PaginationProps) {
	// Hide the entire component if there is only one page to avoid UI clutter.
	if (totalPages <= 1) return null;

	const getPageUrl = (page: number) => {
		// Merge existing search filters with the new page number to preserve state.
		const params = new URLSearchParams({ ...searchParams, page: String(page) });
		return `${baseUrl}?${params.toString()}`;
	};

	const getVisiblePages = () => {
		const delta = 2;
		const range = [];
		const rangeWithDots = [];

		// Generate a window of pages around the current page to prevent long lists.
		for (
			let i = Math.max(2, currentPage - delta);
			i <= Math.min(totalPages - 1, currentPage + delta);
			i++
		) {
			range.push(i);
		}

		// Prepend page 1 and optional ellipsis if the window starts late.
		if (currentPage - delta > 2) {
			rangeWithDots.push(1, "...");
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		// Append the final page and optional ellipsis if the window ends early.
		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push("...", totalPages);
		} else {
			rangeWithDots.push(totalPages);
		}

		return rangeWithDots;
	};

	const visiblePages = getVisiblePages();
	const pagesNumArr = Array.from(Array(totalPages).keys()).map((x) => x + 1);

	return (
		<div className="join">
			<Link
				href={getPageUrl(currentPage - 1)}
				className={`join-item btn btn-sm ${
					currentPage <= 1 ? "btn-disabled" : ""
				}`}
				aria-disabled={currentPage <= 1}
			>
				<ChevronLeft size={16} />
				Prev
			</Link>

			{visiblePages.map((page, key) => {
				if (page === "...") {
					return (
						<div key={key} className="join-item dropdown dropdown-top">
							<div
								tabIndex={0}
								role="button"
								className="btn btn-sm" // Match size and style of page links.
							>
								...
							</div>
							<ul
								tabIndex={-1}
								className="dropdown-content dropdown-top menu bg-base-100 shadow-md rounded-box p-2 z-10 flex flex-row overflow-x-auto overflow-y-scroll whitespace-nowrap max-h-80"
							>
								{pagesNumArr.map((p) => (
									<li key={p} className="inline-block">
										<Link
											href={getPageUrl(p)}
											className={`text-xs ${p === currentPage ? "font-bold text-primary-content bg-primary" : ""}`}
										>
											Page {p}
										</Link>
									</li>
								))}
							</ul>
						</div>
					);
				}

				const pageNumber = page as number;
				const isCurrentPage = pageNumber === currentPage;

				return (
					<Link
						key={key}
						href={getPageUrl(pageNumber)}
						className={`join-item btn btn-sm ${
							isCurrentPage ? "btn-primary" : ""
						}`}
					>
						{pageNumber}
					</Link>
				);
			})}

			<Link
				href={getPageUrl(currentPage + 1)}
				className={`join-item btn btn-sm ${
					currentPage >= totalPages ? "btn-disabled" : ""
				}`}
				aria-disabled={currentPage >= totalPages}
			>
				Next
				<ChevronRight size={16} />
			</Link>
		</div>
	);
}
