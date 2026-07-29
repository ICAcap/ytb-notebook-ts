// Extracts the requesting client's IP for rate-limiting purposes.
// x-forwarded-for's leftmost entry is set by the platform edge (e.g. Vercel) on
// the way in, not appended by the client, so it's safe to trust in that deployment context.
export function getClientIp(request: Request): string {
	const forwardedFor = request.headers.get("x-forwarded-for");
	if (forwardedFor) {
		return forwardedFor.split(",")[0].trim();
	}
	return request.headers.get("x-real-ip") ?? "unknown";
}
