import Link from "next/link";

export default function HeroBanner() {
	return (
		<section
			id="MainContent"
			className="bg-linear-to-b from-primary/15 via-primary/5 to-base-100"
		>
			<div className="mx-auto grid max-w-384 grid-cols-1 items-center gap-16 px-4 py-28 sm:px-6 sm:py-36 lg:grid-cols-12 lg:gap-8 lg:px-8 xl:px-12">
				<div className="text-center lg:col-span-4 lg:text-left">
					<img
						src="/logo.svg"
						alt="logo"
						width={80}
						height={80}
						className="mx-auto size-16 sm:size-20 lg:mx-0"
					/>

					<h1 className="mt-8 text-6xl font-extrabold tracking-tight text-base-content sm:text-7xl lg:text-5xl xl:text-6xl">
						Never lose the important moment again
					</h1>

					<p className="mx-auto mt-8 max-w-2xl text-xl text-pretty text-base-content/70 sm:text-2xl/relaxed lg:mx-0 lg:text-base xl:text-lg">
						YTB Notebook lets you attach rich-text notes to exact moments in a
						YouTube video, organize videos into collections, and jump straight
						back to the moment that mattered.
					</p>

					<div className="mt-10 flex flex-wrap justify-center gap-4 lg:flex-col lg:items-start lg:justify-start xl:flex-row xl:items-center">
						<Link
							className="btn btn-primary btn-lg rounded-full px-10 text-lg lg:btn-md lg:px-6 lg:text-base xl:btn-lg xl:px-10 xl:text-lg"
							href="/sign-in"
						>
							Try It Out
						</Link>

						<Link
							className="btn btn-outline btn-lg rounded-full px-10 text-lg lg:btn-md lg:px-6 lg:text-base xl:btn-lg xl:px-10 xl:text-lg"
							href="/demo"
							target="_blank"
							rel="noopener noreferrer"
						>
							Live Demo
						</Link>
					</div>
				</div>

				<div className="overflow-hidden rounded-2xl border border-base-300 shadow-2xl shadow-primary/20 ring-1 ring-base-content/5 lg:col-span-8 lg:ml-auto">
					<img
						src="/note-ui-example.png"
						alt="YTB Notebook: a YouTube video playing alongside a timestamped, rich-text note editor"
						width={1920}
						height={800}
						className="w-full"
					/>
				</div>
			</div>
		</section>
	);
}
