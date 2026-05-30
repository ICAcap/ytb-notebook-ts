"use client";

import {
	ChevronLeft,
	NotebookPen,
	BarChart3,
	Tv,
	Plus,
	FolderBookmark,
	Settings,
} from "lucide-react";
import Link from "next/link";
import SignOutButton from "./SignOutButton";
import { useState } from "react";

export default function Sidebar({
	currentPath = "/dashboard",
}: {
	currentPath?: string;
}) {
	const [isCollapsed, setIsCollapsed] = useState(false);

	function toggleSidebar() {
		setIsCollapsed((prev) => !prev);
	}

	const navigation = [
		{ name: "Dashboard", href: "/dashboard", icon: BarChart3 },
		{ name: "Add Video", href: "/add-video", icon: Plus },
		{ name: "Videos", href: "/videos", icon: Tv },
		{ name: "Collection", href: "/collection", icon: FolderBookmark },
		{ name: "Setting", href: "/setting", icon: Settings },
	];

	return (
		<aside
			className={`${isCollapsed ? "w-20" : "w-64"} flex flex-col bg-gray-900 text-white min-h-screen z-10 transition-all duration-300 ease-out`}
		>
			<div
				className={`flex items-center p-4 mb-2 ${
					isCollapsed ? "justify-center" : "justify-between"
				}`}
			>
				{!isCollapsed && (
					<div className="flex items-center gap-3 flex-1 min-w-0">
						<NotebookPen className="w-8 h-8 text-amber-300 shrink-0" />
						<span className="text-xl font-bold truncate">YTB Notebook</span>
					</div>
				)}
				<button
					onClick={toggleSidebar}
					aria-label="Toggle Sidebar"
					className="p-1.5 hover:bg-gray-800 rounded-lg transition-all duration-200 shrink-0"
					title={isCollapsed ? "Expand" : "Collapse"}
				>
					<ChevronLeft
						className={`h-5 w-5 transition-transform duration-300 ${
							isCollapsed ? "rotate-180" : ""
						}`}
					/>
				</button>
			</div>

			<nav
				className={`flex-1 px-2 py-4 space-y-1 overflow-y-auto ${
					isCollapsed ? "flex flex-col items-center" : ""
				}`}
			>
				{navigation.map((item, key) => {
					const IconComponent = item.icon;
					const isActive =
						currentPath !== undefined && currentPath === item.href;
					return (
						<Link
							href={item.href}
							key={key}
							title={isCollapsed ? item.name : undefined}
							className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
								isActive
									? "bg-amber-500 text-gray-900"
									: "text-gray-300 hover:bg-gray-800"
							}`}
						>
							<IconComponent className="w-5 h-5 shrink-0" />
							{!isCollapsed && (
								<span className="text-sm font-medium truncate">
									{item.name}
								</span>
							)}
						</Link>
					);
				})}
			</nav>

			<div className="p-3 space-y-2">
				{!isCollapsed && (
					<>
						<SignOutButton />
						<p className="text-xs text-gray-400 text-center">
							© {new Date().getFullYear()} YTB Notebook
						</p>
					</>
				)}
			</div>
		</aside>
	);
}
