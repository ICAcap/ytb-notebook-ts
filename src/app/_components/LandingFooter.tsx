import { ChevronUp } from "lucide-react";

const GITHUB_URL = "https://github.com/ICAcap/ytb-notebook-ts";

export default function LandingFooter() {
	return (
		<footer className="relative rounded-t-3xl bg-base-200">
			<div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:pt-28">
				<div className="absolute inset-e-4 top-4 sm:inset-e-6 sm:top-6 lg:inset-e-8 lg:top-8">
					<a
						className="inline-block w-full rounded-full bg-primary p-2 text-primary-content shadow-sm transition hover:bg-primary/90 sm:p-3 lg:p-4"
						href="#MainContent"
					>
						<ChevronUp className="size-9" aria-hidden="true" />
					</a>
				</div>

				<div className="lg:flex lg:items-end lg:justify-between">
					<div>
						<p className="text-center text-3xl font-bold text-primary lg:text-left">
							YTB Notebook
						</p>

						<p className="mx-auto mt-6 max-w-md text-center text-lg leading-relaxed text-base-content/60 lg:text-left">
							Timestamped, rich-text notes for the videos you actually rewatch —
							organized into collections, always picking up where you left off.
						</p>
					</div>

					<ul className="mt-12 flex flex-wrap justify-center gap-4 lg:mt-0 lg:justify-end">
						<li>
							<a className="btn btn-primary btn-md rounded-full" href="/sign-in">
								Try It Out
							</a>
						</li>

						<li>
							<a
								className="btn btn-outline btn-md rounded-full"
								href={GITHUB_URL}
								target="_blank"
								rel="noopener noreferrer"
							>
								View Source
							</a>
						</li>
					</ul>
				</div>

				<p className="mt-16 text-center text-sm text-base-content/50 lg:text-right">
					Copyright &copy; {new Date().getFullYear()}. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
