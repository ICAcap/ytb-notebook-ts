"use client";

import React, { Dispatch, SetStateAction } from "react";
import TextEditor from "@/_components/RichTextEditor/TextEditor";
import { useForm, SubmitHandler } from "react-hook-form";
import { InputJsonValue } from "../../../../generated/prisma/runtime/client";
import { Note } from "../../../../generated/prisma";
import { getH, getM, getS } from "../../../../utils/formatTimeStamp";
import { NOTE_COLORS } from "../../../../utils/noteColors";
import { AlertCircle } from "lucide-react";

type Props = (Note | null) & {
	playerRef?: React.RefObject<HTMLVideoElement | null>;
	setEditable: Dispatch<SetStateAction<boolean>>;
};

// for RHF type and form validation
type noteForm = {
	startTimeH: number;
	startTimeM: number;
	startTimeS: number;
	endTimeH: number;
	endTimeM: number;
	endTimeS: number;
	color: string;
	content: InputJsonValue;
};

// main component
const EditableNoteCard = (props: Props) => {
	// RHF hook
	const {
		register,
		handleSubmit,
		reset,
		getValues,
		formState: { errors, isSubmitting },
	} = useForm<noteForm>({
		defaultValues: {
			startTimeH: props.startTime
				? getH(props.startTime)
				: getH(props.playerRef?.current?.currentTime ?? 0),
			startTimeM: props.startTime
				? getM(props.startTime)
				: getM(props.playerRef?.current?.currentTime ?? 0),
			startTimeS: props.startTime
				? getS(props.startTime)
				: getS(props.playerRef?.current?.currentTime ?? 0),
			endTimeH: props.endTime
				? getH(props.endTime)
				: getH(props.playerRef?.current?.currentTime ?? 0),
			endTimeM: props.endTime
				? getM(props.endTime)
				: getM(props.playerRef?.current?.currentTime ?? 0),
			endTimeS: props.endTime
				? getS(props.endTime)
				: getS(props.playerRef?.current?.currentTime ?? 0),
			color: props.color,
			content: props.content ? props.content : {},
		},
	});

	// helpers
	const onSubmitNote: SubmitHandler<noteForm> = async (data) => {
		//TBD
		console.log(data.content);
		console.log(data.startTimeH, data.startTimeM, data.startTimeS);
		console.log(data.endTimeH, data.endTimeM, data.endTimeS);
	};

	function cancelEditing() {
		props.setEditable(false);
		reset(); // reset the form inputs to default values
	}

	return (
		<div>
			<header>
				<h1 className="text-lg font-semibold text-center">
					{props.noteId ? "Update Note: " : "Add Note: "}
				</h1>
			</header>
			<form onSubmit={handleSubmit(onSubmitNote)}>
				<div>
					{/* start time */}
					<label className="label">
						<span className="label-text font-semibold">
							Start Time (hh:mm:ss)
						</span>
					</label>
					{/* Individual HH MM SS input */}
					<div className="flex gap-1 items-center">
						<input
							disabled={isSubmitting}
							type="number"
							title="hour"
							placeholder="00"
							min="0"
							max="11"
							className={`input input-bordered input-xs w-12 ${
								errors?.startTimeH ? "input-error" : ""
							}`}
							{...register("startTimeH", {
								valueAsNumber: true,
								min: { value: 0, message: "Hour must be at least 0" },
								max: { value: 11, message: "Hour cannot exceed 11" },
							})}
						/>
						<span>:</span>
						<input
							disabled={isSubmitting}
							type="number"
							title="minute"
							placeholder="00"
							min="0"
							max="59"
							className={`input input-bordered input-xs w-12 ${
								errors?.startTimeM ? "input-error" : ""
							}`}
							{...register("startTimeM", {
								valueAsNumber: true,
								min: { value: 0, message: "Minute must be at least 0" },
								max: { value: 59, message: "Minute cannot exceed 59" },
							})}
						/>
						<span>:</span>
						<input
							disabled={isSubmitting}
							type="number"
							title="second"
							placeholder="00"
							min="0"
							max="59"
							className={`input input-bordered input-xs w-12 ${
								errors?.startTimeS ? "input-error" : ""
							}`}
							{...register("startTimeS", {
								valueAsNumber: true,
								min: { value: 0, message: "Second must be at least 0" },
								max: { value: 59, message: "Second cannot exceed 59" },
							})}
						/>
					</div>
					{(errors?.startTimeH || errors?.startTimeM || errors?.startTimeS) && (
						<div className="label mt-2">
							<span className="label-text-alt text-error flex items-center gap-2">
								<AlertCircle size={16} />
								{errors?.startTimeH?.message ||
									errors?.startTimeM?.message ||
									errors?.startTimeS?.message}
							</span>
						</div>
					)}
				</div>
				<div>
					{/* end time */}
					<label className="label">
						<span className="label-text font-semibold">
							End Time (hh:mm:ss)
						</span>
					</label>
					{/* Individual HH MM SS input */}
					<div className="flex gap-1 items-center">
						<input
							disabled={isSubmitting}
							type="number"
							title="hour"
							placeholder="00"
							min="0"
							max="11"
							className={`input input-bordered input-xs w-12 ${
								errors?.endTimeH ? "input-error" : ""
							}`}
							{...register("endTimeH", {
								valueAsNumber: true,
								min: { value: 0, message: "Hour must be at least 0" },
								max: { value: 11, message: "Hour cannot exceed 11" },
							})}
						/>
						<span>:</span>
						<input
							disabled={isSubmitting}
							type="number"
							title="minute"
							placeholder="00"
							min="0"
							max="59"
							className={`input input-bordered input-xs w-12 ${
								errors?.endTimeM ? "input-error" : ""
							}`}
							{...register("endTimeM", {
								valueAsNumber: true,
								min: { value: 0, message: "Minute must be at least 0" },
								max: { value: 59, message: "Minute cannot exceed 59" },
							})}
						/>
						<span>:</span>
						<input
							disabled={isSubmitting}
							type="number"
							title="second"
							placeholder="00"
							min="0"
							max="59"
							className={`input input-bordered input-xs w-12 ${
								errors?.endTimeS ? "input-error" : ""
							}`}
							{...register("endTimeS", {
								valueAsNumber: true,
								min: { value: 0, message: "Second must be at least 0" },
								max: { value: 59, message: "Second cannot exceed 59" },
								// validate if the end time should >= start time
								validate: (endS) => {
									const values = getValues();
									const startTotal =
										values.startTimeH * 3600 +
										values.startTimeM * 60 +
										values.startTimeS;
									const endTotal =
										values.endTimeH * 3600 + values.endTimeM * 60 + endS;
									return (
										endTotal >= startTotal ||
										"End time can't be before start time"
									);
								},
							})}
						/>
					</div>
					{(errors?.endTimeH || errors?.endTimeM || errors?.endTimeS) && (
						<div className="label mt-2">
							<span className="label-text-alt text-error flex items-center gap-2">
								<AlertCircle size={16} />
								{errors?.endTimeH?.message ||
									errors?.endTimeM?.message ||
									errors?.endTimeS?.message}
							</span>
						</div>
					)}
				</div>
				{/* Note color picker - radio dial (https://daisyui.com/components/radio/) */}
				<div>
					<label className="label">
						<span className="label-text font-semibold">Note Color</span>
					</label>
					<div className="flex gap-4">
						{NOTE_COLORS.map((c) => (
							<label key={c.name} className="cursor-pointer" title={c.name}>
								<input
									type="radio"
									value={c.value}
									defaultChecked={
										props.color
											? c.value === props.color
											: c.value === NOTE_COLORS[0].value
									}
									disabled={isSubmitting}
									className={"radio checked:text-white"}
									style={{ backgroundColor: c.value, borderColor: c.value }}
									{...register("color", { required: "Please pick a color" })}
								/>
							</label>
						))}
					</div>
					{errors?.color && (
						<div className="label mt-2">
							<span className="label-text-alt text-error flex items-center gap-2">
								<AlertCircle size={16} />
								{errors.color.message}
							</span>
						</div>
					)}
				</div>

				{/* content - text editor */}
				<TextEditor contentJson={props.content} />
				<div>
					<button type="button" onClick={cancelEditing} className="btn">
						Cancel
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						className="btn btn-primary"
					>
						{isSubmitting ? (
							<span className="loading loading-spinner loading-sm">
								Submitting
							</span>
						) : (
							<span>Submit</span>
						)}
					</button>
				</div>
			</form>
		</div>
	);
};

export default EditableNoteCard;
