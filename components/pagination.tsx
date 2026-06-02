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
	if (totalPages <= 1) return null;

	const getPageUrl = (page: number) => {
		const params = new URLSearchParams({ ...searchParams, page: String(page) });
		return `${baseUrl}?${params.toString()}`;
	};

	const getVisiblePages = () => {
		const delta = 2;
		const range = [];
		const rangeWithDots = [];

		for (
			let i = Math.max(2, currentPage - delta);
			i <= Math.min(totalPages - 1, currentPage + delta);
			i++
		) {
			range.push(i);
		}

		if (currentPage - delta > 2) {
			rangeWithDots.push(1, "...");
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push("...", totalPages);
		} else {
			rangeWithDots.push(totalPages);
		}

		return rangeWithDots;
	};

	const visiblePages = getVisiblePages();

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
						<span key={key} className="join-item btn btn-sm btn-disabled">
							...
						</span>
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
