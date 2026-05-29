import Sidebar from "../../../components/sidebar";
import requireSession from "@/lib/requireSession";

export default async function VideoPage() {
	await requireSession();

	return (
		<div>
			<Sidebar currentPath="/videos" />
			<main className="ml-64 p-6">
				<h1 className="text-3xl text-center">Video Page</h1>
			</main>
		</div>
	);
}
