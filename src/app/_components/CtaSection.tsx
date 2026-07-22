export default function CtaSection() {
	return (
		<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div className="flex items-center rounded-2xl bg-base-200 p-8 md:p-12 lg:px-16">
					<div className="mx-auto max-w-xl text-center md:text-left">
						<h2 className="text-4xl font-bold text-base-content sm:text-5xl">
							Stop losing your place in the video
						</h2>

						<p className="mt-4 text-lg text-base-content/70 sm:text-xl/relaxed">
							Sign in with Google and start attaching notes to the moments
							that matter. No setup, no credit card.
						</p>

						<div className="mt-6">
							<a className="btn btn-primary btn-lg rounded-full" href="/sign-in">
								Try It Out
							</a>
						</div>
					</div>
				</div>

				<div className="overflow-hidden rounded-2xl">
					<img
						alt="A rich-text note being edited with a color tag and start/end timestamps"
						src="/note-ui-example.jpeg"
						className="h-56 w-full object-cover object-top-right md:h-full"
					/>
				</div>
			</div>
		</section>
	);
}

