import Sidebar from "../../../components/sidebar";
import requireSession from "../../../lib/requireSession";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "YTB Dashboard",
	description: "This is the dashboard page after signing in",
};
export default async function DashboardPage() {
	const session = await requireSession();

	return (
		<div className="flex min-h-screen">
			<Sidebar currentPath="/dashboard" />
			<main className="flex-1 p-6">
				<h1 className="text-blue-300 text-5xl text-center">Dashboard Page</h1>
				<p className="mt-2"> You have signed in.</p>
				<p>{session.user.name}</p>
				<p>{`Is Super Usr? ${session.user.isSuper}`}</p>
			</main>
		</div>
	);
}
