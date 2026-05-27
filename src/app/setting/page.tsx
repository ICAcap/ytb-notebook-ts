import requireSession from "@/lib/requireSession";
import Sidebar from "../../../components/sidebar";

export default async function SettingPage() {
	await requireSession();

	return (
		<div>
			<Sidebar currentPath="/setting" />
			<main className="ml-64 p-6">
				<h1 className="text-blue-300">Setting Page</h1>
			</main>
		</div>
	);
}
