"use client";

import {
	ChevronLeft,
	SwatchBook,
	LayoutPanelLeft,
	Tv,
	FolderBookmark,
	Settings,
	Sun,
	Moon,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export default function Sidebar({
	currentPath = "/dashboard",
}: {
	currentPath?: string;
}) {
	const [isCollapsed, setIsCollapsed] = useState(true);
	const [mounted, setMounted] = useState(false);
	const { setTheme, resolvedTheme } = useTheme();

	useEffect(() => {
		setMounted(true);
	}, []);

	function toggleSidebar() {
		setIsCollapsed((prev) => !prev);
	}

	function handleThemeToggle() {
		setTheme(resolvedTheme === "light" ? "dark" : "light");
	}

	const navigation = [
		{ name: "Dashboard", href: "/dashboard", icon: LayoutPanelLeft },
		{ name: "Videos", href: "/videos", icon: Tv },
		{ name: "Collection", href: "/collection", icon: FolderBookmark },
		{ name: "Setting", href: "/setting", icon: Settings },
	];

	return (
		<aside
			className={`${isCollapsed ? "w-20" : "w-75"} flex flex-col bg-accent text-accent-content min-h-screen z-10 transition-all duration-300 ease-out`}
		>
			<div
				className={`flex items-center p-4 mb-2 ${
					isCollapsed ? "justify-center" : "justify-between"
				}`}
			>
				{!isCollapsed && (
					<div className="flex items-center gap-2 flex-1 min-w-0">
						<SwatchBook className="w-8 h-8 text-amber-300 shrink-0" />
						<span
							className="text-xl font-bold truncate"
							style={{ fontFamily: "Comic Sans MS" }}
						>
							YTB Notebook
						</span>
					</div>
				)}
				<div className="flex items-center gap-1">
					<button
						onClick={handleThemeToggle}
						className="btn btn-ghost btn-sm btn-square"
					>
						{!mounted ? (
							<div className="animate-spin rounded-full h-5 w-5" />
						) : resolvedTheme === "light" ? (
							<Sun className="h-5 w-5" />
						) : (
							<Moon className="h-5 w-5" />
						)}
					</button>
					<button
						onClick={toggleSidebar}
						aria-label="Toggle Sidebar"
						className="btn btn-ghost btn-sm btn-square"
						title={isCollapsed ? "Expand" : "Collapse"}
					>
						<ChevronLeft
							className={`h-5 w-5 transition-transform duration-300 ${
								isCollapsed ? "rotate-180" : ""
							}`}
						/>
					</button>
				</div>
			</div>

			<ul
				className={`menu flex-1 px-2 py-4 overflow-y-auto ${
					isCollapsed ? "flex flex-col items-center" : ""
				}`}
			>
				{navigation.map((item) => {
					const IconComponent = item.icon;
					const isActive =
						currentPath !== undefined && currentPath === item.href;
					return (
						<li key={item.href}>
							<Link
								href={item.href}
								title={isCollapsed ? item.name : undefined}
								className={`rounded-xl transition-colors duration-200 ${
									isActive
										? "bg-secondary text-secondary-content font-semibold"
										: "hover:bg-neutral-content/10"
								}`}
							>
								<IconComponent className="w-7 h-7 shrink-0" />
								{!isCollapsed && (
									<span className="text-2xl font-semibold truncate">
										{item.name}
									</span>
								)}
							</Link>
						</li>
					);
				})}
			</ul>

			<div className="p-3 space-y-2 border-t border-base-content/20">
				{!isCollapsed && (
					<p className="text-base font-semibold text-center">
						© {new Date().getFullYear()} YTB Notebook
					</p>
				)}
			</div>
		</aside>
	);
}
