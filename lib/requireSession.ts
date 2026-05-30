import { redirect } from "next/navigation";
import { auth } from "./auth";
import { headers } from "next/headers";
import { cache } from "react";

//https://tomdekan.com/articles/google-sign-in-nextjs

export default cache(async function requireSession() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session) {
		redirect("/sign-in");
	}
	// console.log("session got");
	return session;
});
