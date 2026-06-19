import requireSession from "../../../lib/requireSession";
import Sidebar from "../../_components/sidebar";
import SignOutButton from "../../_components/SignOutButton";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Settings",
	description: "This is the page for managing your account settings",
};

export default async function SettingPage() {
	await requireSession();

	return (
		<div className="flex min-h-screen">
			<Sidebar currentPath="/setting" />
			<main className="flex-1 p-6">
				<div className="max-w-lg mx-auto">
					<h1 className="text-3xl font-bold mb-8">Settings</h1>
					<div className="card bg-base-100 border border-base-200 shadow-sm">
						<div className="card-body">
							<h2 className="card-title text-lg">Account</h2>
							<SignOutButton />
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
