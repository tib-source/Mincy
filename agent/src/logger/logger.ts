// Inspired by https://oneuptime.com/blog/post/2026-01-30-log-batching/view

import type { JobContext } from "../executors/executor";
import { logger } from "./pino";

interface LogEntry {
	timestamp: number;
	level: string;
	message: string;
}

export class BatchLogger {
	private logs: LogEntry[] = [];
	readonly batchSize: number;
	readonly flushInterval: number;
	private flushTimer: NodeJS.Timeout | null = null;
	readonly token: string;
	readonly server: string;
	readonly context: JobContext;

	constructor(
		context: JobContext,
		token: string,
		server: string,
		batchSize: number = 10,
		flushInterval: number = 5000,
	) {
		this.batchSize = batchSize;
		this.flushInterval = flushInterval;
		this.token = token;
		this.server = server;
		this.context = context;
	}

	log(level: string, message: string) {
		const logEntry: LogEntry = {
			timestamp: Date.now(),
			level,
			message,
		};
		this.logs.push(logEntry);

		if (this.logs.length >= this.batchSize) {
			this.flush();
		} else if (!this.flushTimer) {
			this.flushTimer = setTimeout(() => this.flush(), this.flushInterval);
		}
	}

	async flush() {
		if (this.logs.length === 0) return;

		const logsToSend = this.logs;
		this.logs = [];
		if (this.flushTimer) {
			clearTimeout(this.flushTimer);
			this.flushTimer = null;
		}

		const body = JSON.stringify({
			workflowId: this.context.workflowId,
			jobId: this.context.jobId,
			runId: this.context.runId,
			logs: logsToSend,
		});

		try {
			const res = await fetch(`${this.server}/api/agents/logs`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.token}`,
					"Content-Type": "application/json",
				},
				body: body,
			});
			if (!res.ok) {
				logger.error(`Failed to flush logs: ${res.status}`);
				this.logs = [...logsToSend, ...this.logs];
			}
		} catch (err) {
			logger.error({ error: err }, "Failed to flush logs");
			this.logs = [...logsToSend, ...this.logs];
		}
	}
}
