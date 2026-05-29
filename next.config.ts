import type { NextConfig } from "next";
import { hostname } from "os";

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
};

// next.config.js
module.exports = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "img.youtube.com",
				pathname: "/vi/**",
			},
		],
	},
};

export default nextConfig;
