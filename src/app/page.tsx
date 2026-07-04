import SignIn from "./(auth)/sign-in/page";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "YTB NoteBook Home",
	description: "This is the home page for YTB Notebook",
};

export default function Home() {
	return (
		<section className="bg-base-100 lg:grid lg:h-screen lg:place-content-center">
			<div className="mx-auto w-screen max-w-7xl px-4 py-16 sm:px-6 sm:py-24 md:grid md:grid-cols-2 md:items-center md:gap-4 lg:px-8 lg:py-32">
				<div className="max-w-prose text-left">
					<h1 className="text-4xl font-bold text-base-content sm:text-5xl">
						Something Something
					</h1>

					<p className="mt-4 text-base text-pretty text-base-content/70 sm:text-lg/relaxed">
						Blablabla TBD
					</p>

					<div className="mt-4 flex gap-4 sm:mt-6">
						<a className="btn btn-primary btn-md" href="/sign-in">
							Try It Out
						</a>

						<a className="btn btn-outline btn-md" href="#">
							Learn More
						</a>
					</div>
				</div>

				<img
					src="/logo.svg"
					alt="logo"
					width={640}
					height={640}
					className="shrink-0"
				/>
			</div>
		</section>
	);
}
