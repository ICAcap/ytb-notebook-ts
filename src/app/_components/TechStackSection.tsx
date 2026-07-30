const TECH_STACK_GROUPS = [
	{
		label: "Framework",
		items: [
			{ name: "Next.js", url: "https://nextjs.org" },
			{ name: "TypeScript", url: "https://www.typescriptlang.org" },
		],
	},
	{
		label: "Frontend",
		items: [
			{ name: "React", url: "https://react.dev" },
			{ name: "Tailwind CSS", url: "https://tailwindcss.com" },
			{ name: "DaisyUI", url: "https://daisyui.com" },
			{ name: "Tiptap", url: "https://tiptap.dev" },
			{ name: "GSAP", url: "https://gsap.com" },
		],
	},
	{
		label: "Backend & Data",
		items: [
			{ name: "Prisma", url: "https://www.prisma.io" },
			{ name: "PostgreSQL", url: "https://www.postgresql.org" },
			{ name: "better-auth", url: "https://www.better-auth.com" },
		],
	},
	{
		label: "Infra & Tooling",
		items: [
			{ name: "Upstash Redis", url: "https://upstash.com" },
			{ name: "Puppeteer", url: "https://pptr.dev" },
		],
	},
];

export default function TechStackSection() {
	return (
		<section
			id="tech-stack-section"
			className="mx-auto max-w-384 px-4 sm:px-6 lg:px-8"
		>
			<p
				id="tech-stack-heading"
				className="text-center text-2xl font-extrabold tracking-tight text-base-content sm:text-3xl"
			>
				Built with
			</p>

			<div className="mt-10 space-y-8">
				{TECH_STACK_GROUPS.map((group) => (
					<div
						key={group.label}
						data-tech-group
						className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8"
					>
						<p className="w-40 shrink-0 text-center text-xs font-semibold tracking-widest text-base-content/40 uppercase sm:text-right">
							{group.label}
						</p>

						<ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
							{group.items.map(({ name, url }) => (
								<li key={name} data-tech-item>
									<a
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-lg font-semibold text-base-content/50 transition-colors hover:text-base-content sm:text-xl"
									>
										{name}
									</a>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</section>
	);
}
