import requireSession from "../../../lib/requireSession";
import Sidebar from "../../../components/sidebar";
import SignOutButton from "../../../components/SignOutButton";
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
				<h1 className="text-blue-300">Setting Page</h1>
				<div className="mt-8">
					<SignOutButton />
				</div>
			</main>
		</div>
	);
}
