import requireSession from "../../../lib/requireSession";
import Sidebar from "../../../components/sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Collections",
	description: "This is the page showing all your video collections",
};
export default async function CollectionPage() {
	await requireSession();
	return (
		<div className="flex min-h-screen">
			<Sidebar currentPath="/collection" />
			<main className="flex-1 p-6">
				<h1 className="text-2xl font-bold">Collection Page</h1>
			</main>
		</div>
	);
}
