import SignIn from "./(auth)/sign-in/page";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "YTB NoteBook Home",
	description: "This is the home page for YTB Notebook",
};

export default function Home() {
	return (
		<div className="flex flex-col flex-1 items-center justify-center">
			<h1 className="text-5xl font-bold p-5">Welcome to YTB Notebook</h1>
			<SignIn />
		</div>
	);
}
