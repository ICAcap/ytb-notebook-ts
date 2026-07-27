import { ChevronUp } from "lucide-react";
import Link from "next/link";

const GITHUB_URL = "https://github.com/ICAcap/ytb-notebook-ts";

export default function LandingFooter() {
	return (
		<footer id="landing-footer" className="relative rounded-t-3xl bg-base-200">
			<Link
				className="absolute inset-e-6 -top-6 inline-flex size-12 items-center justify-center rounded-full bg-primary text-primary-content shadow-lg transition hover:bg-primary/90 sm:inset-e-8 sm:-top-7 sm:size-14"
				href="#MainContent"
			>
				<ChevronUp className="size-6 sm:size-7" aria-hidden="true" />
			</Link>

			<div
				id="footer-content"
				className="relative mx-auto max-w-384 px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16"
			>
				<div className="lg:flex lg:items-end lg:justify-between">
					<div>
						<p className="text-center text-4xl font-bold text-primary lg:text-left">
							YTB Notebook
						</p>

						<p className="mx-auto mt-4 max-w-lg text-center text-xl leading-relaxed text-base-content/60 lg:text-left">
							Timestamped, rich-text notes for the videos you actually rewatch —
							organized into collections, always picking up where you left off.
						</p>
					</div>

					<ul className="mt-8 flex flex-wrap justify-center gap-4 lg:mt-0 lg:justify-end">
						<li>
							<Link
								className="btn btn-primary btn-lg rounded-full"
								href="/sign-in"
							>
								Try It Out
							</Link>
						</li>

						<li>
							<a
								className="btn btn-outline btn-lg rounded-full"
								href={GITHUB_URL}
								target="_blank"
								rel="noopener noreferrer"
							>
								View Source
							</a>
						</li>
					</ul>
				</div>

				<p className="mt-10 text-center text-base text-base-content/50 lg:text-right">
					Copyright &copy; {new Date().getFullYear()} YTB Notebook - By Tdub.
					All rights reserved.
				</p>
			</div>
		</footer>
	);
}
