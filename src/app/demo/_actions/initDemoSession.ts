"use server";

import { cookies } from "next/headers";
import { auth } from "../../../../lib/auth";
import { parseSetCookieHeader, toCookieOptions } from "better-auth/cookies";
import { demoAccessRateLimit } from "../../../../utils/ratelimiter";
import { DEMO_VISITOR_COOKIE } from "../../../../middleware";
import { demoVid, demoNote } from "../_data/demoData";
import {
	upsertYouTubeVideo,
	VideoDetailType,
} from "../../../../lib/dbTableAction/videoTableAction";
import { createNote } from "../../../../lib/dbTableAction/noteTableAction";
import { Note, User } from "../../../../generated/prisma";
import { Omit } from "../../../../generated/prisma/runtime/client";

type DemoUser = Omit<User, "image" | "isSuper">;

export type InitDemoResult =
	| { ok: true; userId: string; video: VideoDetailType; note: Note }
	| { ok: false; error: string };

// Server Action: sets the anonymous session cookie and seeds the demo video +
// note. Must run as a Server Action (not during page render) because
// cookies().set() is only permitted in a Server Action or Route Handler.
export async function initDemoSession(): Promise<InitDemoResult> {
	const visitorId =
		(await cookies()).get(DEMO_VISITOR_COOKIE)?.value ?? "unknown";
	const { success } = await demoAccessRateLimit.limit(visitorId);
	if (!success) {
		return {
			ok: false,
			error: "Error 429: Too many demo requests, please try again later",
		};
	}

	let demoUser: DemoUser;
	try {
		const result = await auth.api.signInAnonymous({ returnHeaders: true });
		if (!result?.response?.user) {
			return { ok: false, error: "signInAnonymous returned no user" };
		}
		const setCookieHeader = result.headers.get("set-cookie");
		if (setCookieHeader) {
			const cookieStore = await cookies();
			for (const [name, attributes] of parseSetCookieHeader(
				setCookieHeader,
			)) {
				cookieStore.set(name, attributes.value, toCookieOptions(attributes));
			}
		}
		demoUser = result.response.user as DemoUser;
	} catch (err) {
		console.error(err);
		return {
			ok: false,
			error: `signInAnonymous threw: ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`,
		};
	}

	try {
		const demoVidCreation = await upsertYouTubeVideo(
			demoUser.id,
			demoVid.youtubeVidID,
			demoVid.title,
			[],
			true,
		);
		if (!demoVidCreation) {
			return { ok: false, error: "failed to create demo video" };
		}

		const demoNoteCreation = await createNote({
			userId: demoUser.id,
			videoId: demoVidCreation.videoId,
			...demoNote,
		});
		if (!demoNoteCreation) {
			return { ok: false, error: "failed to create demo note" };
		}

		return {
			ok: true,
			userId: demoUser.id,
			video: demoVidCreation,
			note: demoNoteCreation,
		};
	} catch (err) {
		console.error(err);
		return {
			ok: false,
			error: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
		};
	}
}
