import requireSession from "@/lib/requireSession";
import Sidebar from "../../../components/sidebar";

export default async function AddVideoPage() {
	await requireSession();

	return (
		<div>
			<Sidebar currentPath="/add-video" />
			<main className="ml-64 p-6">
				<h1 className="text-blue-300">Add Video Page</h1>
			</main>
		</div>
	);
}
