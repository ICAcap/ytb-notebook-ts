/**
 * References:
 * https://dev.to/emrahg/how-we-built-an-instant-live-demo-system-for-our-saas-product-5d8k
 * https://dev.to/daanish2003/anonymous-login-using-betterauth-nextjs-prisma-shadcn-5334
 * https://better-auth.com/docs/plugins/anonymous#migrate-the-database
 */

import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import DemoBootstrap from "./_components/DemoBootstrap";

export const metadata: Metadata = {
	title: "YTB Demo",
	description: "Live Demo Page",
};

// html
export default function DemoPage() {
	return (
		<div>
			<Toaster />
			<DemoBootstrap />
		</div>
	);
}
