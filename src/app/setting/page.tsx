import React from "react";
import Sidebar from "../components/sidebar";

const SettingPage = () => {
	return (
		<div>
			<Sidebar currentPath="/setting" />
			<main className="ml-64 p-6">
				<h1 className="text-blue-300">Setting Page</h1>
			</main>
		</div>
	);
};

export default SettingPage;
