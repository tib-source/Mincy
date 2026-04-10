export function getDuration(started: Date, finished?: Date): string {
    if (!finished) {
        return "--";
    }
    const diff = Math.floor(
        (finished.getTime() - started.getTime()) / 1000
    );
    if (diff < 60){ 
        return `${diff}s`;
    }

    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
}
