import {
	NotebookPen,
	BarChart3,
	Tv,
	Plus,
	FolderBookmark,
	Settings,
} from "lucide-react";
import Link from "next/link";

export default function Sidebar({
	currentPath = "/dashboard",
}: {
	currentPath?: string;
}) {
	const navigation = [
		{ name: "Dashboard", href: "/dashboard", icon: BarChart3 },
		{ name: "Add Video", href: "/add-video", icon: Plus },
		{ name: "Video", href: "/video", icon: Tv },
		{ name: "Collection", href: "/collection", icon: FolderBookmark },
		{ name: "Setting", href: "/setting", icon: Settings },
	];
	return (
		<div className="fixed left-0 top-0 bg-gray-900 text-white w-64 min-h-screen p-6 z-10">
			<div className="mb-8">
				<div className="flex items-center space-x-2 mb-4">
					<NotebookPen className="w-7 h-7 text-amber-300" />
					<span className="text-2xl font-semibold">YTB Notebook</span>
				</div>
			</div>

			<nav className="space-y-1">
				{navigation.map((item, key) => {
					const IconComponent = item.icon;
					const isActive =
						currentPath !== undefined && currentPath === item.href;
					return (
						<Link
							href={item.href}
							key={key}
							className={`flex items-center space-x-3 py-2 px-3 rounded-lg ${
								isActive
									? "bg-purple-100 text-gray-800"
									: "hover:bg-gray-800 text-gray-300"
							}`}
						>
							<IconComponent className="w-5 h-5" />
							<span className="text-sm">{item.name}</span>
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
