"use client";

import { usePathname } from "next/navigation";

/**
 * Hook to determine if the current route is a demo page.
 */
export function useIsDemoRoute() {
	return usePathname().startsWith("/demo");
}
