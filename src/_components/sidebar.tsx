"use client";

import {
	PanelRightOpen,
	LayoutDashboard,
	Tv,
	FolderBookmark,
	BookSearch,
	Settings,
	Sun,
	Moon,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

// Responsive notes:
// - phones (below md, "max-md:"): slim 48px icon rail, smaller icons/padding, can't be expanded
// - short screens (phones in landscape, "[@media(max-height:500px)]:"): logo & footer hidden and
//   tighter gaps so every item fits the height without wrapping
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

	function handleThemeToggle(theme: "light" | "dark") {
		setTheme(theme);
	}

	const navigation = [
		{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
		{ name: "Videos", href: "/videos", icon: Tv },
		{ name: "Collection", href: "/collection", icon: FolderBookmark },
		{ name: "Notes", href: "/notes", icon: BookSearch },
		{ name: "Setting", href: "/setting", icon: Settings },
	];

	return (
		<aside
			className={`${isCollapsed ? "w-20" : "w-45"} max-md:w-12 flex flex-col shrink-0 bg-accent text-accent-content sticky top-0 h-dvh z-10 transition-all duration-100 ease-out`}
		>
			<div className="flex flex-col items-center p-3 max-md:p-2 mb-2 max-md:mb-0 gap-2 [@media(max-height:500px)]:hidden">
				<img
					src="/logo.svg"
					alt="YTB Notebook"
					width={48}
					height={48}
					className="shrink-0 max-md:w-8 max-md:h-8"
				/>
			</div>

			<ul
				className={`menu flex-nowrap gap-5 max-md:gap-2 [@media(max-height:500px)]:gap-1 px-2 max-md:px-1 py-4 [@media(max-height:500px)]:py-2 overflow-y-auto ${
					isCollapsed ? "flex flex-col flex-1 items-center" : ""
				}`}
			>
				<li>
					{isCollapsed ? (
						<button
							onClick={() =>
								handleThemeToggle(resolvedTheme === "light" ? "dark" : "light")
							}
							className="rounded-lg hover:bg-neutral-content/10 max-md:p-2"
							title="Toggle theme"
						>
							{!mounted ? (
								<div className="w-6 h-6 max-md:w-5 max-md:h-5" />
							) : resolvedTheme === "light" ? (
								<Sun className="w-6 h-6 max-md:w-5 max-md:h-5" />
							) : (
								<Moon className="w-6 h-6 max-md:w-5 max-md:h-5" />
							)}
						</button>
					) : (
						<div className="join w-full">
							<button
								onClick={() => handleThemeToggle("light")}
								className={`join-item btn btn-square flex-1 flex items-center justify-center py-1.5 ${resolvedTheme === "light" && mounted ? "bg-secondary text-secondary-content" : "hover:bg-neutral-content/10"}`}
								title="Light"
							>
								<Sun className="w-6 h-6" />
							</button>
							<button
								onClick={() => handleThemeToggle("dark")}
								className={`join-item btn btn-square flex-1 flex items-center justify-center py-1.5 ${resolvedTheme === "dark" && mounted ? "bg-secondary text-secondary-content" : "hover:bg-neutral-content/10"}`}
								title="Dark"
							>
								<Moon className="w-6 h-6" />
							</button>
						</div>
					)}
				</li>
				{/* no room to expand the rail on phones, so the toggle is hidden there */}
				<li className="max-md:hidden">
					<button
						onClick={toggleSidebar}
						aria-label="Toggle Sidebar"
						title={isCollapsed ? "Expand" : "Collapse"}
						className="rounded-lg hover:bg-neutral-content/10 w-full flex items-center gap-2"
					>
						<PanelRightOpen
							className={`w-6 h-6 shrink-0 cursor-pointer transition-transform duration-100 ${isCollapsed ? "rotate-180" : ""}`}
						/>
						{!isCollapsed && (
							<span className="text-base font-semibold truncate">Collapse</span>
						)}
					</button>
				</li>
				{navigation.map((item) => {
					const IconComponent = item.icon;
					const isActivePath =
						currentPath !== undefined && currentPath === item.href;
					return (
						<li key={item.href}>
							<Link
								href={item.href}
								title={isCollapsed ? item.name : undefined}
								aria-label={item.name}
								className={`rounded-lg max-md:p-2 ${
									isActivePath
										? "bg-secondary text-secondary-content font-semibold"
										: "hover:bg-neutral-content/10"
								}`}
							>
								<IconComponent className="w-6 h-6 max-md:w-5 max-md:h-5 shrink-0" />
								{!isCollapsed && (
									<span className="text-base font-semibold truncate">
										{item.name}
									</span>
								)}
							</Link>
						</li>
					);
				})}
			</ul>

			<div className="p-3 space-y-2 border-t border-base-content/20 max-md:hidden [@media(max-height:500px)]:hidden">
				{!isCollapsed && (
					<p className="text-xs font-semibold text-center">
						© {new Date().getFullYear()} YTB Notebook
					</p>
				)}
			</div>
		</aside>
	);
}
