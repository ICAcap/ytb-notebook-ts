import { auth } from "../../../../lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { anonymousSignInRateLimit } from "../../../../utils/ratelimiter";
import { getClientIp } from "../../../../utils/getClientIp";

const { GET, POST: authPOST } = toNextJsHandler(auth.handler);

export { GET };

// Anonymous sign-in mints a fresh userId per call, which resets every per-user
// rate limit downstream, so it needs its own IP-keyed limit here.
export async function POST(request: Request) {
	if (new URL(request.url).pathname.endsWith("/sign-in/anonymous")) {
		const { success } = await anonymousSignInRateLimit.limit(
			getClientIp(request),
		);
		if (!success) {
			return new Response("Too Many Requests", { status: 429 });
		}
	}

	return authPOST(request);
}
