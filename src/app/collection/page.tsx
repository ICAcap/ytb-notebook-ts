import Sidebar from "../../../components/sidebar";

const CollectionPage = () => {
	return (
		<div>
			<Sidebar currentPath="/collection" />
			<main className="ml-64 p-6">
				<h1 className="text-blue-300">Collection Page</h1>
			</main>
		</div>
	);
};

export default CollectionPage;
