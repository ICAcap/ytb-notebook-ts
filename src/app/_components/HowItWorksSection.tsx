"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = [
	{
		title: "Take notes as you watch",
		description: (
			<>
				Attach rich-text notes to the{" "}
				<strong className="text-[1.1em] underline">Exact Moment</strong> in a
				video, right from the player.
			</>
		),
		image: "/note-ui-example.png",
		alt: "Adding a timestamped, rich-text note next to a playing video",
	},
	{
		title: "Organize into collections",
		description: (
			<>
				Group related videos into{" "}
				<strong className="text-[1.1em] underline">Collections</strong> to
				keep research, courses, or projects tidy.
			</>
		),
		image: "/collection-example.png",
		alt: "A grid of video collections such as Course, Favorite, and Watch Later",
	},
	{
		title: "Export to PDF",
		description: (
			<>
				Turn a video&apos;s notes into a clean,{" "}
				<strong className="text-[1.1em] underline">
					Ready-to-Share PDF
				</strong>{" "}
				in one click.
			</>
		),
		image: "/pdf-export-example.png",
		alt: "An exported PDF of a note with its timestamp and formatted text",
	},
];

export default function HowItWorksSection() {
	const [activeIndex, setActiveIndex] = useState(0);
	const activeStep = STEPS[activeIndex];

	function goToPrev() {
		setActiveIndex((current) => (current - 1 + STEPS.length) % STEPS.length);
	}

	function goToNext() {
		setActiveIndex((current) => (current + 1) % STEPS.length);
	}

	return (
		<section
			id="how-it-works-section"
			className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8"
		>
			<div id="how-it-works-heading" className="mx-auto max-w-3xl text-center">
				<h2 className="text-5xl font-bold text-base-content sm:text-6xl">
					See it in action
				</h2>
			</div>

			<div
				id="how-it-works-panel"
				className="mt-16 overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-lg"
			>
				<div className="grid gap-12 p-10 sm:p-14 lg:grid-cols-5 lg:items-center lg:p-16">
					<div className="lg:col-span-2">
						<span className="text-sm font-extrabold tracking-widest text-base-content/40 uppercase">
							Step {activeIndex + 1} of {STEPS.length}
						</span>

						<h3 className="mt-4 text-4xl font-bold text-base-content">
							{activeStep.title}
						</h3>

						<p className="mt-4 text-pretty text-xl text-base-content/70">
							{activeStep.description}
						</p>

						<div className="mt-10 flex items-center gap-4">
							<button
								type="button"
								onClick={goToPrev}
								aria-label="Previous step"
								className="inline-flex size-13 items-center justify-center rounded-full border border-base-300 text-base-content transition-colors hover:bg-base-200"
							>
								<ChevronLeft className="size-6" />
							</button>

							<button
								type="button"
								onClick={goToNext}
								aria-label="Next step"
								className="inline-flex size-13 items-center justify-center rounded-full border border-base-300 text-base-content transition-colors hover:bg-base-200"
							>
								<ChevronRight className="size-6" />
							</button>
						</div>
					</div>

					<div className="relative h-80 overflow-hidden rounded-2xl border border-base-300 bg-base-200 sm:h-96 lg:col-span-3 lg:h-128">
						<Image
							key={activeStep.image}
							src={activeStep.image}
							alt={activeStep.alt}
							fill
							className="object-contain"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
