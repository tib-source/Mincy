import type { LogEvent } from "pino";

export interface Job {
	name: string;
	image: string;
	cmd: [string];
	logs: [LogEvent];
	status: string;
}
