/**
 * References:
 * https://dev.to/emrahg/how-we-built-an-instant-live-demo-system-for-our-saas-product-5d8k
 * https://dev.to/daanish2003/anonymous-login-using-betterauth-nextjs-prisma-shadcn-5334
 * https://better-auth.com/docs/plugins/anonymous#migrate-the-database
 */

import { Suspense } from "react";
import { authClient } from "../../../lib/auth-client";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Note, User } from "../../../generated/prisma";
import { Omit } from "../../../generated/prisma/runtime/client";
import { demoVid, demoNote } from "./_data/demoData";
import {
	upsertYouTubeVideo,
	VideoDetailType,
} from "../../../lib/dbTableAction/videoTableAction";
import { createNote } from "../../../lib/dbTableAction/noteTableAction";
import VideoDetailView from "../videos/[id]/_components/VideoDetailView";

type DemoUser = Omit<User, "image" | "isAnonymous" | "isSuper">;
const TEST_NOTE_NUM = 3;

export const metadata: Metadata = {
	title: "YTB Demo",
	description: "Live Demo Page",
};

// helper to get anonymous user
async function getAnonymousUser(): Promise<DemoUser | null> {
	try {
		const user = (await authClient.signIn.anonymous()).data?.user;
		return user ?? null;
	} catch (err) {
		console.error(err);
		return null;
	}
}

// helper to seed demo video and note for the demo user
async function seedDemo(
	demoUser: DemoUser,
): Promise<{ video: VideoDetailType; note: Note } | null> {
	try {
		// seed video
		const demoVidCreation = await upsertYouTubeVideo(
			demoUser.id,
			demoVid.youtubeVidID,
			demoVid.title,
			[],
			true,
		);
		if (!demoVidCreation)
			throw Error("failed to create demo video, note seeding canceled");

		// seed note
		const demoNoteCreation = await createNote({
			userId: demoUser.id,
			videoId: demoVidCreation.videoId,
			...demoNote,
		});
		if (!demoNoteCreation) throw Error("failed to create demo note");

		return { video: demoVidCreation, note: demoNoteCreation };
	} catch (err) {
		console.error(err);
		return null;
	}
}

// html
export default async function Demo() {
	const demoUser = await getAnonymousUser();
	const seedVidNote = demoUser ? await seedDemo(demoUser) : null;

	return (
		<div>
			<Toaster />
			<Suspense
				fallback={<span className="loading loading-spinner loading-xl"></span>}
			>
				{demoUser && seedVidNote ? (
					<VideoDetailView
						userId={demoUser.id}
						video={seedVidNote.video}
						notes={[seedVidNote.note]}
					/>
				) : (
					<div className="alert alert-error text-xl text-error-content mb-4">
						Demo creation failed, please try again later
					</div>
				)}
			</Suspense>
		</div>
	);
}
