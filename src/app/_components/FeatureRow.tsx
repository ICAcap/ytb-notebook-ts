import { Clock, FileDown, FolderOpen, PlayCircle } from "lucide-react";

const FEATURES = [
	{
		icon: Clock,
		title: "Timestamped Notes",
		description:
			"Attach rich-text notes to the exact moment in a video, so context is never lost.",
		color: "#26A2FF",
	},
	{
		icon: FolderOpen,
		title: "Collections",
		description:
			"Group related videos into collections to keep research, courses, or projects organized.",
		color: "#3FA301",
	},
	{
		icon: PlayCircle,
		title: "Resume Playback",
		description:
			"Pick up right where you left off — playback position is saved automatically.",
		color: "#FF9026",
	},
	{
		icon: FileDown,
		title: "Export to PDF",
		description:
			"Export a single note or an entire video's notes to a clean, ready-to-share PDF.",
		color: "#FF0000",
	},
];

export default function FeatureRow() {
	return (
		<section>
			<div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{FEATURES.map(({ icon: Icon, title, description, color }) => (
						<div
							key={title}
							className="flex flex-col items-start gap-4 rounded-2xl border border-base-300 bg-base-100 p-8 transition-all hover:-translate-y-1 hover:shadow-lg"
						>
							<div
								className="inline-flex size-14 shrink-0 items-center justify-center rounded-xl"
								style={{ backgroundColor: `${color}1A`, color }}
							>
								<Icon className="size-7" />
							</div>

							<div>
								<h3 className="text-xl font-semibold text-base-content">
									{title}
								</h3>

								<p className="mt-2 text-pretty text-base text-base-content/70">
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
