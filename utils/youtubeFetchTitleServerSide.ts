"use server";

const youtubeAPIKey = process.env.YOUTUBE_API_KEY as string;

export async function fetchYouTubeTitle(
	videoId: string,
	apiKey: string = youtubeAPIKey,
): Promise<string | null> {
	const baseUrl = "https://www.googleapis.com/youtube/v3/videos";
	const url = `${baseUrl}?id=${videoId}&part=snippet&key=${apiKey}`;
	try {
		const response = await fetch(url, { cache: "force-cache" });

		if (!response.ok) {
			// Log status code to identify if it is an auth (403) or quota (403) issue
			console.error(`YouTube API responded with ${response.status}`);
			return null;
		}

		const data = await response.json();

		// Ensure items array exists and has content before accessing index 0
		if (!data.items || data.items.length === 0) {
			console.error("YouTube video not found for ID:", videoId);
			return null;
		}
		const title = data.items[0].snippet.title;
		// console.log(title);
		return title;
	} catch (error) {
		// Catch network failures to prevent the entire page from crashing (Triggering error.ts)
		console.error("Network error while fetching YouTube title:", error);
		return null;
	}
}
