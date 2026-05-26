import React from "react";
import Sidebar from "../components/sidebar";

const DashboardPage = () => {
	return (
		<div>
			<Sidebar currentPath="/dashboard" />
			<main className="ml-64 p-6">
				<h1 className="text-blue-300">Dashboard Page</h1>
			</main>
		</div>
	);
};

export default DashboardPage;
