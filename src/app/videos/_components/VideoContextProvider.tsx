"use client";
import { createContext, useState, Dispatch, SetStateAction } from "react";

type Props = {
	children: React.ReactNode;
	trashModalOpen: boolean;
	setTrashModalOpen: Dispatch<SetStateAction<boolean>>;
	pencilModalOpen: boolean;
	setPencilModalOpen: Dispatch<SetStateAction<boolean>>;
};
export const VideoContext = createContext<Props | null>(null);

export default function VideoContextProvider({ children }: Props) {
	const [trashModalOpen, setTrashModalOpen] = useState(false);
	const [pencilModalOpen, setPencilModalOpen] = useState(false);

	return (
		<VideoContext.Provider
			value={{
				children,
				trashModalOpen,
				setTrashModalOpen,
				pencilModalOpen,
				setPencilModalOpen,
			}}
		>
			{children}
		</VideoContext.Provider>
	);
}
