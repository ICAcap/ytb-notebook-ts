import { Quote } from "lucide-react";

export default function AboutSection() {
	return (
		<section>
			<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
				<div className="rounded-3xl bg-base-200 p-10 shadow-sm sm:p-14">
					<div className="inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
						<Quote className="size-7" fill="currentColor" strokeWidth={0} />
					</div>

					<p className="mt-8 text-pretty text-xl/relaxed text-base-content/80">
						I kept rewatching long tutorials and lecture videos just to find
						the one moment I needed, scrubbing through a timeline with no
						context. So I built YTB Notebook: drop a rich-text note on the
						exact second it applies to, then jump straight back to it later.
					</p>

					<div className="mt-8 flex items-center gap-3">
						<span className="flex size-10 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-content">
							N
						</span>

						<span className="text-base font-medium text-base-content/60">
							— built solo, for my own rewatching habit
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
