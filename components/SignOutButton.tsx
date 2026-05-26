"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/router";

export const SignOutButton = () => {
	const router = useRouter();

	const handleSignOut = async () => {
		await authClient.signOut();
	};

	return (
		<button
			onClick={handleSignOut}
			className="text-xs text-red-500 transition hover:text-red-300"
		>
			Sign Out
		</button>
	);
};
