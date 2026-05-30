"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../../../lib/auth-client";

export default function SignIn() {
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		// Manually update the browser tab title
		document.title = "Sign In - YTB Notebook";
	}, []);

	useEffect(() => {
		if (!isPending && session) {
			router.replace("/dashboard");
		}
	}, [session, isPending, router]); // redirect to dashboard if already signed in

	const handleLogin = async () => {
		try {
			setError(null);
			setLoading(true);
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/dashboard",
			});
		} catch (err) {
			const message =
				err instanceof Error
					? err.message
					: "Sign in failed. Please try again.";
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center gap-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-10 py-8 shadow-sm">
			<div className="flex flex-col items-center gap-1 text-center">
				<h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
					Welcome back
				</h2>
				<p className="text-sm text-neutral-500 dark:text-neutral-400">
					Sign in to continue to YTB Notebook
				</p>
			</div>
			{error && (
				<div className="rounded-md bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
					{error}
				</div>
			)}
			<button
				onClick={handleLogin}
				disabled={loading}
				className="flex items-center justify-center gap-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 shadow-sm transition hover:bg-neutral-50 dark:hover:bg-neutral-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
			>
				{!loading && (
					<img
						src="/web_neutral_rd_na.svg"
						alt="Google"
						width="20"
						height="20"
					/>
				)}
				{loading ? "Signing in..." : "Continue with Google"}
			</button>
		</div>
	);
}
