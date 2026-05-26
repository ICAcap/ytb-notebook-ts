/**
 * SignIn component providing a Google social authentication entry point.
 * This page handles the redirection to the external OAuth provider via the authClient.
 */

"use client";

import { authClient } from "@/lib/auth-client";
import { LogIn } from "lucide-react";

export default function SignIn() {
	const handleLogin = async () =>
		authClient.signIn.social({
			provider: "google",
			callbackURL: "/dashboard", // Redirects the user to the dashboard after successful authentication.
		});

	return (
		<main className="flex max-h-64 min-h-45 min-w-xl items-center justify-center p-3 rounded-3xl bg-amber-50">
			<button
				onClick={handleLogin}
				className="rounded-2xl bg-amber-500 px-6 py-3 text-white hover:opacity-80 transition-opacity"
			>
				<div className="text-2xl flex items-center gap-2">
					<LogIn />
					<span>Sign in with Google</span>
				</div>
			</button>
		</main>
	);
}
