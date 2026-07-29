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
	limiter: Ratelimit.slidingWindow(10, "60 s"),
	analytics: true,
	timeout: 30000,
	prefix: "ratelimit:youtube",
});

export const noteWriteRateLimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.slidingWindow(30, "60 s"),
	analytics: true,
	timeout: 20000,
	prefix: "ratelimit:note-write",
});

export const videoWriteRateLimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.slidingWindow(10, "60 s"),
	analytics: true,
	timeout: 20000,
	prefix: "ratelimit:video-write",
});

export const collectionWriteRateLimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.slidingWindow(20, "60 s"),
	analytics: true,
	timeout: 20000,
	prefix: "ratelimit:collection-write",
});

export const demoAccessRateLimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.slidingWindow(15, "60 s"),
	analytics: true,
	timeout: 120000,
	prefix: "ratelimit:demo",
});

// Keyed on IP (not userId) since anonymous sign-in mints a brand new userId every call.
export const anonymousSignInRateLimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.slidingWindow(5, "60 s"),
	analytics: true,
	timeout: 20000,
	prefix: "ratelimit:anon-signin",
});
