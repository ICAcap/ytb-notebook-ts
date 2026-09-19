import { Quote } from "lucide-react";

export default function AboutSection() {
	return (
		<section id="about-section">
			<div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-2xl rounded-3xl bg-base-200 p-8 text-center shadow-sm sm:p-10">
					<div
						id="quote"
						className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<Quote className="size-6" fill="currentColor" strokeWidth={0} />
					</div>

					<p
						id="about-text"
						className="mt-6 text-pretty text-lg/relaxed text-base-content/80"
					>
						YouTube is a goldmine for learning, but it&apos;s a battle against
						the algorithm. To combat doomscrolling through recommendations and{" "}
						<em className="underline">
							Passively Watching Videos Without Retaining A Thing
						</em>
						. I built YTB Notebook to stop the noise and bring back the power
						of{" "}
						<strong className="text-[1.15em] underline">
							Active Note-Taking Learning
						</strong>
						.
					</p>

					<div
						id="about-signature"
						className="mt-6 flex items-center justify-center gap-4"
					>
						<span className="flex size-10 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-content">
							Tdub
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
