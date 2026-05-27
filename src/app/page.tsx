import SignIn from "./(auth)/sign-in/page";

export default function Home() {
	return (
		<div className="flex flex-col flex-1 items-center justify-center">
			<h1 className="text-5xl font-bold p-5">Welcome to YTB Notebook</h1>
			<SignIn />
		</div>
	);
}
