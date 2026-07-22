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
		<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-2xl text-center">
				<h2 className="text-4xl font-bold text-base-content sm:text-5xl">
					Frequently asked questions
				</h2>
			</div>

			<div className="mx-auto mt-12 max-w-2xl space-y-4">
				{FAQS.map(({ question, answer }, index) => (
					<details
						key={question}
						className="group [&_summary::-webkit-details-marker]:hidden"
						open={index === 0}
					>
						<summary className="flex items-center justify-between gap-1.5 rounded-xl border border-base-300 bg-base-200 p-5 text-base-content">
							<h3 className="text-xl font-medium">{question}</h3>

							<ChevronDown
								className="size-5 shrink-0 transition-transform duration-300 group-open:-rotate-180"
								aria-hidden="true"
							/>
						</summary>

						<p className="px-4 pt-4 text-lg text-base-content/70">{answer}</p>
					</details>
				))}
			</div>
		</section>
	);
}
