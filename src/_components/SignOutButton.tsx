"use client";

import { authClient } from "../../lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
	const router = useRouter();

	const handleSignOut = async () => {
		await authClient.signOut();
		localStorage.clear();
		router.refresh();
	};

	return (
		<button
			onClick={handleSignOut}
			className="btn btn-warning w-full gap-2 my-3"
		>
			<LogOut size={18} />
			<span>Sign Out</span>
		</button>
	);
}
