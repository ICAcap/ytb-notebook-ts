import Sidebar from "../../../components/sidebar";

const VideoPage = () => {
	return (
		<div>
			<Sidebar currentPath="/video" />
			<main className="ml-64 p-6">
				<h1 className="text-blue-300">Video Page</h1>
			</main>
		</div>
	);
};

export default VideoPage;
