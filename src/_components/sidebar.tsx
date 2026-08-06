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
			className={`${isCollapsed ? "w-20" : "w-56"} flex flex-col bg-accent text-accent-content min-h-screen z-10 transition-all duration-300 ease-out`}
		>
			<div className="flex flex-col p-3 mb-2 gap-2">
				<div className="flex items-center justify-between">
					<img
						src="/logo.svg"
						alt="YTB Notebook"
						width={32}
						height={32}
						className="shrink-0"
					/>
					<button
						onClick={toggleSidebar}
						aria-label="Toggle Sidebar"
						className="p-1 rounded-lg hover:bg-neutral-content/10"
						title={isCollapsed ? "Expand" : "Collapse"}
					>
						<PanelRightOpen
							className={`w-6 h-6 cursor-pointer transition-transform duration-100 ${isCollapsed ? "rotate-180" : ""}`}
						/>
					</button>
				</div>
			</div>

			<ul
				className={`menu gap-5 px-2 py-4 overflow-y-auto ${
					isCollapsed ? "flex flex-col flex-1 items-center" : ""
				}`}
			>
				<li>
					{isCollapsed ? (
						<button
							onClick={() =>
								handleThemeToggle(resolvedTheme === "light" ? "dark" : "light")
							}
							className="rounded-lg hover:bg-neutral-content/10"
							title="Toggle theme"
						>
							{!mounted ? (
								<div className="w-6 h-6" />
							) : resolvedTheme === "light" ? (
								<Sun className="w-6 h-6" />
							) : (
								<Moon className="w-6 h-6" />
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
				{navigation.map((item) => {
					const IconComponent = item.icon;
					const isActive =
						currentPath !== undefined && currentPath === item.href;
					return (
						<li key={item.href}>
							<Link
								href={item.href}
								title={isCollapsed ? item.name : undefined}
								className={`rounded-lg ${
									isActive
										? "bg-secondary text-secondary-content font-semibold"
										: "hover:bg-neutral-content/10"
								}`}
							>
								<IconComponent className="w-6 h-6 shrink-0" />
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

			<div className="p-3 space-y-2 border-t border-base-content/20">
				{!isCollapsed && (
					<p className="text-xs font-semibold text-center">
						© {new Date().getFullYear()} YTB Notebook - By Tdub
					</p>
				)}
			</div>
		</aside>
	);
}
