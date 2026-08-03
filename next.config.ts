import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactCompiler: true,
	serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
	outputFileTracingIncludes: {
		"/api/notes/[noteId]/pdf": ["./node_modules/@sparticuz/chromium/bin/**"],
		"/api/notes/video/[videoId]/pdf": [
			"./node_modules/@sparticuz/chromium/bin/**",
		],
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "img.youtube.com",
				pathname: "/vi/**",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
				pathname: "/**",
			},
		],
	},
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{ key: "X-Frame-Options", value: "DENY" },
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
				],
			},
		];
	},
};

export default nextConfig;
