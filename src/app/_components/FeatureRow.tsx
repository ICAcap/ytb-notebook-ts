import { Clock, FileDown, FolderOpen, PlayCircle } from "lucide-react";

const FEATURES = [
	{
		icon: Clock,
		title: "Timestamped Notes",
		description: (
			<>
				Attach rich-text notes to the{" "}
				<strong className="text-[1.1em] underline">Exact Moment</strong> in a
				video, so context is{" "}
				<strong className="text-[1.1em] underline">Never Lost</strong>.
			</>
		),
		color: "#26A2FF",
	},
	{
		icon: FolderOpen,
		title: "Collections",
		description: (
			<>
				Group related videos into{" "}
				<strong className="text-[1.1em] underline">Collections</strong> to
				keep research, courses, or projects organized.
			</>
		),
		color: "#3FA301",
	},
	{
		icon: PlayCircle,
		title: "Resume Playback",
		description: (
			<>
				Pick up right where you left off — playback position is{" "}
				<strong className="text-[1.1em] underline">
					Saved Automatically
				</strong>
				.
			</>
		),
		color: "#FF9026",
	},
	{
		icon: FileDown,
		title: "Export to PDF",
		description: (
			<>
				Export a single note or an entire video&apos;s notes to a clean,{" "}
				<strong className="text-[1.1em] underline">
					Ready-to-Share PDF
				</strong>
				.
			</>
		),
		color: "#FF0000",
	},
];

export default function FeatureRow() {
	return (
		<section id="feature-row">
			<div className="mx-auto max-w-[1800px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{FEATURES.map(({ icon: Icon, title, description, color }) => (
						<div
							key={title}
							className="feature-card flex flex-col items-start gap-6 rounded-2xl border border-base-300 bg-base-100 p-12 transition-all hover:-translate-y-1 hover:shadow-lg"
						>
							<div
								className="inline-flex size-20 shrink-0 items-center justify-center rounded-xl"
								style={{ backgroundColor: `${color}1A`, color }}
							>
								<Icon className="size-10" />
							</div>

							<div>
								<h3 className="text-3xl font-bold text-base-content">
									{title}
								</h3>

								<p className="mt-4 text-pretty text-xl text-base-content/70">
									{description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
