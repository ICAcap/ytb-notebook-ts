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
				className="relative mx-auto max-w-[1800px] px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16"
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
							<Link
								className="btn btn-outline btn-lg rounded-full"
								href="/demo"
								target="_blank"
								rel="noopener noreferrer"
							>
								Live Demo
							</Link>
						</li>

						<li>
							<a
								className="btn btn-lg rounded-full border-black bg-black text-white hover:border-black hover:bg-black/80"
								href={GITHUB_URL}
								target="_blank"
								rel="noopener noreferrer"
							>
								<svg
									aria-hidden="true"
									width="16"
									height="16"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
								>
									<path
										fill="white"
										d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
									></path>
								</svg>
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
