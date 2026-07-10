"use client";

// reference: https://nextjs.org/docs/app/getting-started/error-handling#global-errors
// only in production
export default function GlobalError({
	error,
	unstable_retry,
}: {
	error: Error & { digest?: string };
	unstable_retry?: () => void;
}) {
	return (
		<html>
			<body>
				<h2>Oops, something went wrong, please try again later.</h2>
				<span>{error.digest}</span>
				{unstable_retry && (
					<button className="btn" onClick={() => unstable_retry()}>
						Try again
					</button>
				)}
			</body>
		</html>
	);
}
