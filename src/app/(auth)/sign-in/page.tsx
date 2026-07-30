"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../../../lib/auth-client";

export default function SignIn() {
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const redirectRoute = "/dashboard";

	useEffect(() => {
		// Manually update the browser tab title
		document.title = "Sign In to YTB Notebook";
	}, []);

	useEffect(() => {
		if (!isPending && session) {
			router.replace(redirectRoute);
		}
	}, [session, isPending, router]); // redirect to dashboard if already signed in when land on /sign-in

	const handleLogin = async () => {
		try {
			setError(null);
			setLoading(true);
			await authClient.signIn.social({
				provider: "google",
				callbackURL: redirectRoute,
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
		<div>
			<section>
				<div className="mx-auto max-w-full my-auto max-h-dvh h-dvh">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="bg-base-200 p-8 md:p-12 lg:px-16 lg:py-24">
							<div className="mx-auto max-w-xl text-center">
								<h2 className="text-5xl font-bold text-base-content">
									Start by Google Sign-In
								</h2>

								<p className="hidden text-2xl text-base-content/70 sm:mt-4 sm:block">
									YTB Notebook is just one-click away
								</p>

								<div className="mt-4 md:mt-8">
									{error && (
										<div className="alert alert-error text-sm mb-4">
											{error}
										</div>
									)}
									{isPending || session ? (
										<div className="skeleton btn btn-lg w-56"></div>
									) : (
										<button
											onClick={handleLogin}
											disabled={loading}
											className="btn btn-lg btn-primary gap-3"
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
									)}
								</div>
							</div>
						</div>

						<div className="hidden md:block">
							<img
								alt=""
								src="https://images.unsplash.com/photo-1615107899082-044cc1133649?q=80&w=956&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
								className="h-64 w-full object-cover sm:h-80 md:h-full"
							/>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
