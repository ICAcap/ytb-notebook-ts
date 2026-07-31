import { Quote } from "lucide-react";

export default function AboutSection() {
	return (
		<section id="about-section">
			<div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8">
				<div className="rounded-3xl bg-base-200 p-12 shadow-sm sm:p-16">
					<div
						id="quote"
						className="inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<Quote className="size-8" fill="currentColor" strokeWidth={0} />
					</div>

					<p
						id="about-text"
						className="mt-10 text-pretty text-2xl/relaxed text-base-content/80"
					>
						YouTube is a goldmine for learning, but it's a battle against the
						algorithm. To combat doomscrolling through recommendations and
						passively watching videos without retaining a thing. I built YTB
						Notebook to stop the noise and bring back the power of active
						note-taking learning.
					</p>

					<div id="about-signature" className="mt-10 flex items-center gap-4">
						<span className="flex size-12 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-content">
							Tdub
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
