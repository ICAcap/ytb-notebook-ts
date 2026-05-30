"use client";

import { authClient } from "../lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
	const router = useRouter();

	const handleSignOut = async () => {
		await authClient.signOut();
		router.refresh();
	};

	return (
		<button
			onClick={handleSignOut}
			className="flex items-center justify-center gap-2 my-3 w-full bg-amber-600 text-white text-sm font-medium p-2.5 rounded-lg transition-all duration-200 hover:bg-red-600 active:scale-95"
		>
			<LogOut size={18} />
			<span>Sign Out</span>
		</button>
	);
}
