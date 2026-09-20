import { Metadata } from "next";
import HeroBanner from "./_components/HeroBanner";
import FeatureRow from "./_components/FeatureRow";
import HowItWorksSection from "./_components/HowItWorksSection";
import AboutSection from "./_components/AboutSection";
import TechStackSection from "./_components/TechStackSection";
import FaqSection from "./_components/FaqSection";
import LandingFooter from "./_components/LandingFooter";
import LandingPageGsapAnimation from "./_components/LandingPageGsapAnimation";

export const metadata: Metadata = {
	title: "Welcome to YTB NoteBook",
	description:
		"Save YouTube video links, take timestamped rich-text notes, organize them into collections, and export your notes to PDF. Try the live demo, no sign-up.",
};

export default function Home() {
	return (
		<>
			<LandingPageGsapAnimation />

			<HeroBanner />

			{/* Alternating section bands: base-300 / base-100 (base-200 is too close to base-100 in dark) */}
			<div className="bg-base-300 py-16 sm:py-24">
				<div
					id="features"
					className="mx-auto grid max-w-[1800px] gap-8 px-4 sm:px-6 lg:grid-cols-5 lg:gap-10 lg:px-8"
				>
					<AboutSection />
					<FeatureRow />
				</div>
			</div>

			<div id="how-it-works" className="bg-base-100 py-16 sm:py-24">
				<HowItWorksSection />
			</div>

			<div id="faq" className="bg-base-300 py-16 sm:py-24">
				<FaqSection />
			</div>

			<div className="bg-base-100 py-16 sm:py-24">
				<TechStackSection />
			</div>

			<LandingFooter />
		</>
	);
}
