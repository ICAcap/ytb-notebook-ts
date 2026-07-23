import { ChevronDown } from "lucide-react";

const FAQS = [
	{
		question: "What data do you collect?",
		answer:
			"Your name, email, and profile picture from Google sign-in, plus whatever you create in the app — video entries, collections, and notes — and your last playback position per video so it can resume where you left off. That's it.",
	},
	{
		question: "Is my data shared with anyone?",
		answer:
			"No. Your notes and video data are stored in a PostgreSQL database and only used to run the app for you. Nothing is sold, shared, or used for advertising.",
	},
	{
		question: "Is this open source?",
		answer:
			"Yes — the full source is on GitHub. Feel free to read the code, self-host it, or open an issue if something looks off.",
	},
	{
		question: "Is it free to use?",
		answer:
			"Yes. This is a personal project, not a commercial product — sign in with Google and use it at no cost.",
	},
];

export default function FaqSection() {
	return (
		<section id="faq-section" className="mx-auto max-w-384 px-4 sm:px-6 lg:px-8">
			<div id="faq-heading" className="mx-auto max-w-3xl text-center">
				<h2 className="text-5xl font-bold text-base-content sm:text-6xl">
					Frequently asked questions
				</h2>
			</div>

			<div className="mx-auto mt-16 max-w-3xl space-y-5">
				{FAQS.map(({ question, answer }, index) => (
					<details
						key={question}
						data-faq-item
						className="group [&_summary::-webkit-details-marker]:hidden"
						open={index === 0}
					>
						<summary className="flex items-center justify-between gap-1.5 rounded-xl border border-base-300 bg-base-200 p-6 text-base-content">
							<h3 className="text-2xl font-medium">{question}</h3>

							<ChevronDown
								className="size-6 shrink-0 transition-transform duration-300 group-open:-rotate-180"
								aria-hidden="true"
							/>
						</summary>

						<p className="px-5 pt-5 text-xl text-base-content/70">{answer}</p>
					</details>
				))}
			</div>
		</section>
	);
}
