import { Metadata } from "next";
import Sidebar from "../../../components/sidebar";
import requireSession from "../../../lib/requireSession";
import AddVideoForm from "./_components/AddVideoForm";
import VideoCard from "../videos/_components/VideoCard";

export const metadata: Metadata = {
	title: "Add Video",
	description: "Add Youtube Video to Your Notebook Here.",
};

export default async function AddVideoPage() {
	const session = await requireSession();
	const userId = session.user.id;

	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar currentPath="/add-video" />
			<main className="flex-1 overflow-y-auto p-6">
				<h1 className="text-4xl font-bold text-center mb-8">
					Add Video Welcome {session.user.name}
				</h1>
				<AddVideoForm userId={userId} />
			</main>
		</div>
	);
}
