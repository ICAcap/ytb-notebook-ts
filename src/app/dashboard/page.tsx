import Sidebar from "../../../components/sidebar";
import { SignOutButton } from "../../../components/SignOutButton";

import requireSession from "@/lib/requireSession";

export default async function DashboardPage() {
	const session = await requireSession();

	return (
		<div>
			<Sidebar currentPath="/dashboard" />
			<main className="ml-64 p-6">
				<h1 className="text-blue-300 text-5xl text-center">Dashboard Page</h1>
				<p className="mt-2"> You have signed in Woohoooooooo</p>
				<p>{session.user.name}</p>
				<p>{`Is Super Usr? ${session.user.isSuper}`}</p>
				<SignOutButton />
			</main>
		</div>
	);
}
