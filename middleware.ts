import { NextRequest, NextResponse } from "next/server";

const DEMO_VISITOR_COOKIE = "ytb_demo_visitor_id";

export function middleware(request: NextRequest) {
	// Create a response that allows the request to proceed
	const response = NextResponse.next();

	if (!request.cookies.get(DEMO_VISITOR_COOKIE)) {
		// Create a random unique ID and set it as a cookie
		// https://nextjs.org/docs/app/api-reference/functions/cookies#setting-a-cookie
		response.cookies.set(DEMO_VISITOR_COOKIE, crypto.randomUUID(), {
			httpOnly: true, // Prevents client-side JS from accessing the cookie
			secure: process.env.NODE_ENV === "production", // HTTPS only in production
			sameSite: "lax", // Protects against cross-site request forgery
			path: "/", // Available across the entire site
			maxAge: 60 * 60 * 24 * 30, // Expire after
		});
	}

	return response;
}

// Only trigger this middleware when visiting the /demo page
export const config = {
	matcher: ["/demo"],
};
