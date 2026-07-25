import { Metadata } from "next";
import HeroBanner from "./_components/HeroBanner";
import FeatureRow from "./_components/FeatureRow";
import AboutSection from "./_components/AboutSection";
import CtaSection from "./_components/CtaSection";
import FaqSection from "./_components/FaqSection";
import LandingFooter from "./_components/LandingFooter";
import LandingPageGsapAnimation from "./_components/LandingPageGsapAnimation";

export const metadata: Metadata = {
	title: "Welcome to YTB NoteBook",
	description: "This is the home page for YTB Notebook",
};

export default function Home() {
	return (
		<>
			<LandingPageGsapAnimation />
			<HeroBanner />

			<div className="mt-12 sm:mt-20">
				<AboutSection />
			</div>

			<div id="features" className="mt-12 sm:mt-20">
				<FeatureRow />
			</div>

			<div className="mt-12 sm:mt-20">
				<CtaSection />
			</div>

			<div id="faq" className="mt-12 sm:mt-20">
				<FaqSection />
			</div>

			<div className="mt-12 sm:mt-20">
				<LandingFooter />
			</div>
		</>
	);
}
