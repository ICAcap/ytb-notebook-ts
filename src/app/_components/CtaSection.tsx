export default function CtaSection() {
	return (
		<section id="cta-section" className="mx-auto max-w-384 px-4 sm:px-6 lg:px-8">
			<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
				<div
					id="cta-text"
					className="flex items-center rounded-2xl bg-base-200 p-10 md:p-16 lg:px-20"
				>
					<div className="mx-auto max-w-xl text-center md:text-left">
						<h2 className="text-5xl font-bold text-base-content sm:text-6xl">
							Stop losing your place in the video
						</h2>

						<p className="mt-6 text-xl text-base-content/70 sm:text-2xl/relaxed">
							Sign in with Google and start attaching notes to the moments
							that matter. No setup, no credit card.
						</p>

						<div className="mt-8">
							<a
								className="btn btn-primary btn-lg rounded-full px-10 text-lg"
								href="/sign-in"
							>
								Try It Out
							</a>
						</div>
					</div>
				</div>

				<div id="cta-image" className="overflow-hidden rounded-2xl">
					<img
						alt="A rich-text note being edited with a color tag and start/end timestamps"
						src="/note-ui-example.jpeg"
						className="h-80 w-full object-cover object-center md:h-full"
					/>
				</div>
			</div>
		</section>
	);
}

