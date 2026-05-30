import requireSession from "../../../lib/requireSession";
import Sidebar from "../../../components/sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Add Video",
	description: "This is the page for adding new videos",
};

export default async function AddVideoPage() {
	await requireSession();

	return (
		<div className="flex min-h-screen">
			<Sidebar currentPath="/add-video" />
			<main className="flex-1 p-6">
				<h1 className="text-blue-300">Add Video Page</h1>
			</main>
		</div>
	);
}
