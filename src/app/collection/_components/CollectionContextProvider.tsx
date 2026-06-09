"use client";

import { createContext } from "react";

// reference: https://nextjs.org/docs/app/getting-started/server-and-client-components#context-providers
export const CollectionContext = createContext<{ userId: string } | null>(null);

type Props = {
	userId: string;
	children: React.ReactNode;
};

export default function CollectionContextProvider({ userId, children }: Props) {
	return (
		<CollectionContext.Provider value={{ userId }}>
			{children}
		</CollectionContext.Provider>
	);
}
