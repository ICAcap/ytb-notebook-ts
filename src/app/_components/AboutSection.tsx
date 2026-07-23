import { Quote } from "lucide-react";

export default function AboutSection() {
	return (
		<section id="about-section">
			<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
						I kept rewatching long tutorials and lecture videos just to find the
						one moment I needed, scrubbing through a timeline with no context.
						So I built YTB Notebook: drop a rich-text note on the exact second
						it applies to, then jump straight back to it later.
					</p>

					<div id="about-signature" className="mt-10 flex items-center gap-4">
						<span className="flex size-12 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-content">
							Tdub
						</span>

						<span className="text-lg font-medium text-base-content/60">
							— built solo, for my own rewatching habit
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
