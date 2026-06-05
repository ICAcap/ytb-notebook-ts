const YOUTUBE_URL_REGEX =
	/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)[\w-]{11}(?:(?:\?|&).*)?$/; // Allow trailing query parameters like playlist IDs.

export function getYoutubeId(url: string): string | null {
	const regExpr =
		/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	const match = url.match(regExpr);
	return match && match[2].length === 11 ? match[2] : null;
}

export function getThumbnailUrl(youtubeVideoId: string): string {
	return `https://img.youtube.com/vi/${youtubeVideoId}/mqdefault.jpg`;
}

export function validateYoutubeUrl(url: string): boolean {
	return YOUTUBE_URL_REGEX.test(url);
}
