export function getDuration(started: Date, finished?: Date): string {
	if (!finished) {
		return "--";
	}
	const diff = Math.floor((finished.getTime() - started.getTime()) / 1000);
	if (diff < 60) {
		return `${diff}s`;
	}

	const m = Math.floor(diff / 60);
	const s = diff % 60;
	return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) {
		return `${bytes} B`;
	}
	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}
	if (bytes < 1024 * 1024 * 1024) {
		return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
	}
	return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
