import requireSession from "../../../lib/requireSession";
import Sidebar from "../../_components/sidebar";
import SignOutButton from "../../_components/SignOutButton";
import PurgeAccountButton from "./_components/PurgeAccountButton";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Settings",
	description: "This is the page for managing your account settings",
};

export default async function SettingPage() {
	const session = await requireSession();

	return (
		<div className="flex min-h-screen">
			<Sidebar currentPath="/setting" />
			<main className="flex-1 p-6">
				<div className="max-w-lg mx-auto flex flex-col gap-6">
					<h1 className="text-3xl font-bold mb-2">Settings</h1>
					<div className="card bg-base-100 border border-base-200 shadow-sm">
						<div className="card-body">
							<h2 className="card-title text-lg">Account</h2>
							<SignOutButton />
						</div>
					</div>

					{!session.user.isAnonymous && (
						<div className="card bg-base-100 border border-error/40 shadow-sm">
							<div className="card-body">
								<h2 className="card-title text-lg text-error">Danger Zone</h2>
								<p className="text-sm text-base-content/70">
									Permanently delete your account and all of your videos,
									collections, and notes. This action cannot be undone.
								</p>
								<PurgeAccountButton userId={session.user.id} />
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
