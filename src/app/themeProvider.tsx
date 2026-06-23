"use client";

import { ThemeProvider } from "next-themes";

// to solver flicker flash
// reference https://www.youtube.com/watch?v=7zqI4qMDdg8
export function ThemeProviders({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="data-theme"
			defaultTheme="light"
			value={{ light: "retro", dark: "abyss" }}
		>
			{children}
		</ThemeProvider>
	);
}
