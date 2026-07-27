import { JSONContent } from "@tiptap/react";

const noteContentObj = {
	type: "doc",
	content: [
		{
			type: "heading",
			attrs: {
				level: 1,
				textAlign: null,
			},
			content: [
				{
					text: "TLDR: Building a 2D Platformer (CS50 2D)",
					type: "text",
					marks: [
						{
							type: "textStyle",
							attrs: {
								color: "",
							},
						},
						{
							type: "bold",
						},
					],
				},
				{
					text: " ",
					type: "text",
				},
			],
		},
		{
			type: "heading",
			attrs: {
				level: 2,
				textAlign: null,
			},
			content: [
				{
					text: "This lecture focuses on creating a ",
					type: "text",
				},
				{
					text: "Super Mario Bros",
					type: "text",
					marks: [
						{
							type: "italic",
						},
					],
				},
				{
					text: "-style game, moving from simple shapes to complex virtual worlds. Key takeaways include:",
					type: "text",
				},
			],
		},
		{
			type: "bulletList",
			content: [
				{
					type: "listItem",
					content: [
						{
							type: "paragraph",
							attrs: {
								textAlign: null,
							},
							content: [
								{
									text: "World Building:",
									type: "text",
									marks: [
										{
											type: "textStyle",
											attrs: {
												color: "",
											},
										},
										{
											type: "bold",
										},
									],
								},
								{
									text: " Using tile maps for level rendering and ",
									type: "text",
								},
								{
									text: "love.graphics.translate",
									type: "text",
									marks: [
										{
											type: "code",
										},
									],
								},
								{
									text: " for a scrolling camera.",
									type: "text",
								},
							],
						},
					],
				},
				{
					type: "listItem",
					content: [
						{
							type: "paragraph",
							attrs: {
								textAlign: null,
							},
							content: [
								{
									text: "TBD...",
									type: "text",
								},
							],
						},
					],
				},
			],
		},
		{
			type: "paragraph",
			attrs: {
				textAlign: null,
			},
		},
	],
} as JSONContent;

export const demoVid = {
	youtubeVidID: "wjzaqNwZrPM",
	title: "CS50 2D - Lecture 4 - Super Mario Bros",
};

export const demoNote = {
	startTime: 5,
	endTime: 10,
	content: noteContentObj,
	color: "#FF0000",
};
