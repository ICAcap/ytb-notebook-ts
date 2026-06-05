"use client";

import { useState } from "react";
import Sidebar from "../../../components/sidebar";
import { validateYoutubeUrl } from "../../../utils/youtube";
import { FilePlay } from "lucide-react";
export default function AddVideoPage() {
	const [url, setUrl] = useState("");
	const [isValid, setIsValid] = useState(false);

	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar currentPath="/add-video" />
			<main className="flex-1 overflow-y-auto p-6">
				<h1 className="text-4xl font-bold text-center mb-8">Add Video</h1>
				<div className="join">
					<div className="flex flex-1">
						<label className="input validator join-item">
							<FilePlay />
							<input
								className={`input-accent ${!isValid && url ? "input-error" : ""}`}
								onChange={(e) => {
									e.preventDefault();
									const valid = validateYoutubeUrl(e.target.value);
									setUrl(e.target.value);
									setIsValid(valid);
								}}
								required
								type="text"
								placeholder="https://www.youtube.com/watch?v=..."
								title="Paste Valid Youtube URL Here"
							/>
						</label>
					</div>
					<button className="btn btn-error text-lg rounded-r-lg text-accent-content join-item">
						Continue
					</button>
					{!isValid && url && (
						<div className="text-error text-sm mt-1">
							Please Enter Valid YouTube URL
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
