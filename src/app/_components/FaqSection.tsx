import { Gift, Lock, Database } from "lucide-react";

const faqs = [
	{
		icon: Gift,
		title: "Free to use",
		description:
			"This is a side project, not a commercial product — sign in with Google and use it at no cost.",
	},
	{
		icon: Database,
		title: "Only what's yours",
		description:
			"Just the essentials from Google sign-in, plus whatever you create yourself — your videos, collections, and notes.",
	},
	{
		icon: Lock,
		title: "Never shared",
		description:
			"Everything you add is stored securely and used only to run the app for you. Nothing is sold, shared, or repurposed.",
	},
];

export default function FaqSection() {
	return (
		<section
			id="faq-section"
			className="mx-auto max-w-384 px-4 sm:px-6 lg:px-8"
		>
			<div id="faq-heading" className="mx-auto max-w-3xl text-center">
				<h2 className="text-5xl font-bold text-base-content sm:text-6xl">
					Good to know
				</h2>
			</div>

			<div className="mx-auto mt-16 grid max-w-6xl gap-10 sm:grid-cols-3">
				{faqs.map(({ icon: Icon, title, description }) => (
					<div
						key={title}
						data-faq-item
						className="rounded-3xl bg-base-200 p-12 text-center shadow-sm"
					>
						<div className="mx-auto inline-flex size-18 items-center justify-center rounded-full bg-primary/10 text-primary">
							<Icon className="size-9" strokeWidth={2} />
						</div>

						<h3 className="mt-6 text-3xl font-medium text-base-content">
							{title}
						</h3>

						<p className="mt-4 text-xl text-base-content/70">{description}</p>
					</div>
				))}
			</div>
		</section>
	);
}
