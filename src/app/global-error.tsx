"use client";

// reference: https://nextjs.org/docs/app/getting-started/error-handling#global-errors
// only in production mode
export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void; // reset error-boundary to trigger re-render
}) {
	return (
		<html data-theme="cmyk">
			<body>
				<div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
					<div className="card w-full max-w-md bg-base-100 shadow-xl">
						<div className="card-body items-center text-center gap-4">
							<h2 className="card-title text-xl">
								Oops, something went wrong, please try again later.
							</h2>
							<button className="btn btn-primary" onClick={() => reset()}>
								Try again
							</button>
						</div>
					</div>
				</div>
			</body>
		</html>
	);
}
