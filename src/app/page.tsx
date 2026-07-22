import { Metadata } from "next";
import FeatureRow from "./_components/FeatureRow";
import AboutSection from "./_components/AboutSection";
import CtaSection from "./_components/CtaSection";
import FaqSection from "./_components/FaqSection";
import LandingFooter from "./_components/LandingFooter";

export const metadata: Metadata = {
	title: "YTB NoteBook Home",
	description: "This is the home page for YTB Notebook",
};

export default function Home() {
	return (
		<>
			<section
				id="MainContent"
				className="bg-linear-to-b from-primary/15 via-primary/5 to-base-100"
			>
				<div className="mx-auto w-full max-w-4xl px-4 pt-24 pb-14 text-center sm:px-6 sm:pt-32">
					<img
						src="/logo.svg"
						alt="logo"
						width={64}
						height={64}
						className="mx-auto size-14 sm:size-16"
					/>

					<h1 className="mt-6 text-4xl font-bold text-base-content sm:text-5xl md:text-6xl">
						Timestamped notes for the videos you actually rewatch
					</h1>

					<p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-base-content/70 sm:text-xl/relaxed">
						YTB Notebook lets you attach rich-text notes to exact moments in a
						YouTube video, organize videos into collections, and jump straight
						back to the moment that mattered.
					</p>

					<div className="mt-8 flex flex-wrap justify-center gap-4">
						<a
							className="btn btn-primary btn-lg rounded-full px-8"
							href="/sign-in"
						>
							Try It Out
						</a>

						<a
							className="btn btn-outline btn-lg rounded-full px-8"
							href="https://github.com/ICAcap/ytb-notebook-ts"
							target="_blank"
							rel="noopener noreferrer"
						>
							View Source
						</a>
					</div>
				</div>

				<div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
					<div className="overflow-hidden rounded-2xl border border-base-300 shadow-2xl shadow-primary/20 ring-1 ring-base-content/5">
						<img
							src="/note-ui-example.jpeg"
							alt="YTB Notebook: a YouTube video playing alongside a timestamped, rich-text note editor"
							width={1920}
							height={800}
							className="w-full"
						/>
					</div>
				</div>
			</section>

			<div className="mt-20 sm:mt-32">
				<AboutSection />
			</div>

			<div id="features" className="mt-20 sm:mt-32">
				<FeatureRow />
			</div>

			<div className="mt-20 sm:mt-32">
				<CtaSection />
			</div>

			<div id="faq" className="mt-20 sm:mt-32">
				<FaqSection />
			</div>

			<div className="mt-20 sm:mt-32">
				<LandingFooter />
			</div>
		</>
	);
}
