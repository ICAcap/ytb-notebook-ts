"use client";

import { useEffect, useState } from "react";
import VideoDetailView from "../../videos/[id]/_components/VideoDetailView";
import { initDemoSession, InitDemoResult } from "../_actions/initDemoSession";

export default function DemoBootstrap() {
	const [result, setResult] = useState<InitDemoResult | null>(null);

	useEffect(() => {
		initDemoSession().then(setResult);
	}, []);

	if (!result) {
		return <span className="loading loading-spinner loading-xl"></span>;
	}

	if (!result.ok) {
		return (
			<div className="alert alert-error text-xl text-error-content mb-4 whitespace-pre-wrap">
				Demo creation failed, please try again later
				{"\n\nDEBUG: "}
				{result.error}
			</div>
		);
	}

	return (
		<VideoDetailView
			userId={result.userId}
			video={result.video}
			notes={[result.note]}
		/>
	);
}
