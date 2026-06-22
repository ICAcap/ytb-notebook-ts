export function getH(timestamp: number) {
	return Math.floor(timestamp / 3600);
}

export function getM(timestamp: number) {
	return Math.floor((timestamp % 3600) / 60);
}

export function getS(timestamp: number) {
	return Math.floor(timestamp % 60);
}

export function formatTimeStamp(timestamp: number): string {
	if (timestamp < 0) {
		return "00:00";
	}

	const hours = getH(timestamp);
	const minutes = getM(timestamp);
	const seconds = getS(timestamp);

	// Pad minutes and seconds to always be 2 digits (e.g., 5 -> "05")
	const paddedMinutes = String(minutes).padStart(2, "0");
	const paddedSeconds = String(seconds).padStart(2, "0");

	if (hours > 0) {
		// Format as H:MM:SS or HH:MM:SS
		return `${hours}:${paddedMinutes}:${paddedSeconds}`;
	} else {
		// Format as MM:SS
		return `${paddedMinutes}:${paddedSeconds}`;
	}
}
