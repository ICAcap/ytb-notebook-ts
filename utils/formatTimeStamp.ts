export function formatTimeStamp(timestamp: number): string {
	if (timestamp < 0) {
		return "00:00";
	}

	const hours = Math.floor(timestamp / 3600);
	const minutes = Math.floor((timestamp % 3600) / 60);
	const seconds = Math.floor(timestamp % 60);

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
