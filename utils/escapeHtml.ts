// Escapes user-controlled text before interpolating it into raw HTML strings
// (e.g. Puppeteer page.setContent), preventing stored XSS/SSRF via injected markup.
export function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}
