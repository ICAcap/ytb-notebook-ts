export default function Loading() {
	// Add global fallback UI that will be shown while the route is loading.
	return (
		<div className="flex items-center justify-center h-screen">
			<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-400"></div>
		</div>
	);
}
