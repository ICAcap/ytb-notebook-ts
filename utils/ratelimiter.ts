import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
// reference: https://ratelimit-with-upstash.vercel.app/
export const pdfExportRatelimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.slidingWindow(5, "10 s"),
	analytics: true,
	timeout: 20000,
	prefix: "ratelimit:pdfExport",
});

export const youtubeRatelimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.slidingWindow(1, "60 s"),
	analytics: true,
	timeout: 30000,
	prefix: "ratelimit:youtube",
});
