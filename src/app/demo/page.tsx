/**
 * References:
 * https://dev.to/emrahg/how-we-built-an-instant-live-demo-system-for-our-saas-product-5d8k
 * https://dev.to/daanish2003/anonymous-login-using-betterauth-nextjs-prisma-shadcn-5334
 * https://better-auth.com/docs/plugins/anonymous#migrate-the-database
 */

import { Metadata } from "next";
import { cookies } from "next/headers";
import { Toaster } from "react-hot-toast";
import { auth } from "../../../lib/auth";
import { demoAccessRateLimit } from "../../../utils/ratelimiter";
import { DEMO_VISITOR_COOKIE } from "../../../middleware";
import { demoVid, demoNote } from "./_data/demoData";
import {
	upsertYouTubeVideo,
	VideoDetailType,
} from "../../../lib/dbTableAction/videoTableAction";
import { createNote } from "../../../lib/dbTableAction/noteTableAction";
import { Note, User } from "../../../generated/prisma";
import { Omit } from "../../../generated/prisma/runtime/client";
import VideoDetailView from "../videos/[id]/_components/VideoDetailView";

export const metadata: Metadata = {
	title: "YTB Demo",
	description: "Live Demo Page",
};

type DemoUser = Omit<User, "image" | "isSuper">;

type InitDemoResult =
	| { ok: true; userId: string; video: VideoDetailType; note: Note }
	| { ok: false; error: string };

// Creates an anonymous demo user (without persisting its session cookie to
// the browser) and seeds the demo video + note.
async function initDemoSession(): Promise<InitDemoResult> {
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
		const result = await auth.api.signInAnonymous();
		if (!result?.user) {
			return { ok: false, error: "signInAnonymous returned no user" };
		}
		// Intentionally not persisting the returned session cookie to the
		// browser — the demo doesn't rely on cookie-based auth (userId is
		// passed to VideoDetailView as a prop instead), and writing it would
		// overwrite any real session cookie shared across tabs in the same
		// browser.
		demoUser = result.user as DemoUser;
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

// UI demo page
export default async function DemoPage() {
	const result = await initDemoSession();

	return (
		<div>
			<Toaster />
			{result.ok ? (
				<VideoDetailView
					userId={result.userId}
					video={result.video}
					notes={[result.note]}
				/>
			) : (
				<div className="alert alert-error text-xl text-error-content mb-4">
					Demo creation failed, please try again later
				</div>
			)}
		</div>
	);
}
