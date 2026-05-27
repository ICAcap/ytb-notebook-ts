import requireSession from "@/lib/requireSession";
import Sidebar from "../../../components/sidebar";

export default async function CollectionPage() {
	await requireSession();
	return (
		<div>
			<Sidebar currentPath="/collection" />
			<main className="ml-64 p-6">
				<h1 className="text-blue-300">Collection Page</h1>
			</main>
		</div>
	);
}
