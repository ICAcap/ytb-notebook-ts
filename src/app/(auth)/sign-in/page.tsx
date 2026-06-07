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
		<div className="card bg-base-100 shadow-sm">
			<div className="card-body items-center gap-6 text-center">
				<div>
					<h2 className="card-title text-base-content">Welcome back</h2>
					<p className="text-sm text-base-content/60">
						Sign in to continue to YTB Notebook
					</p>
				</div>
				{error && (
					<div className="alert alert-error text-sm">
						{error}
					</div>
				)}
				<button
					onClick={handleLogin}
					disabled={loading}
					className="btn btn-neutral gap-3"
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
		</div>
	);
}
