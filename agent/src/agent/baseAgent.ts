import type { Run } from "@mincy/shared";
import { logger } from "../logger/pino";
import { BaseExecutor } from "../executors/executor";
import { retry } from "../util";

export default class Agent {
	readonly id: string;
	readonly name: string;
	readonly capacity: number;
	readonly token: string;
	readonly workdir: string;
	readonly pollInterval: number = 3000;
	readonly server: string;
	readonly executor: BaseExecutor;
	private activeJobs: number = 0;
	private heartbeatId: NodeJS.Timeout | null = null;
	private jobPollId: NodeJS.Timeout | null = null;

	constructor(
		id: string,
		name: string,
		capacity: number,
		workdir: string,
		token: string,
		executor: BaseExecutor,
		server: string,
	) {
		this.id = id;
		this.name = name;
		this.capacity = capacity;
		this.workdir = workdir;
		this.token = token;
		this.executor = executor;
		this.server = server;
	}

	async register(): Promise<void> {
		await retry(async () => {
			const res = await this.sendAuthenticatedRequest(
				`${this.server}/api/agents/register`,
				{
					method: "POST",
				},
			);

			if (!res.ok) throw new Error("Agent failed to register");
		});
		logger.info("Agent registered successfully");
		this.startHeartbeat();
		this.startJobPoll();
	}

	async execute(run: Run): Promise<void> {
		try {
			logger.info({ run }, "Starting job execution");
			await this.updateJobStatus(run.id, "running");
			const exitCode = await this.executor.execute(run);
			const status = exitCode === 0 ? "passed" : "failed";
			await this.updateJobStatus(run.id, status);
		} catch (error) {
			logger.error({ error }, "Error during job execution");
			await this.updateJobStatus(run.id, "failed");
		}
	}

	stop(): void {
		if (this.heartbeatId) {
			clearInterval(this.heartbeatId);
			this.heartbeatId = null;
		}
		if (this.jobPollId) {
			clearInterval(this.jobPollId);
			this.jobPollId = null;
		}
	}

	private startHeartbeat(): void {
		if (this.heartbeatId) return;
		this.heartbeatId = setInterval(() => this.heartbeat(), this.pollInterval);
	}

	private startJobPoll(): void {
		if (this.jobPollId) return;
		this.jobPollId = setInterval(async () => {
			if (this.activeJobs >= this.capacity) {
				return;
			}
			const run = await this.findJob();
			if (run) {
				this.execute(run).finally(() => {
					this.activeJobs--;
				});
				this.activeJobs++;
			}
		}, this.pollInterval);
	}

	private async heartbeat(): Promise<void> {
		const res = await this.sendAuthenticatedRequest(
			`${this.server}/api/agents/heartbeat`,
		);
		if (!res.ok) {
			logger.warn("Failed to send heartbeat");
			return;
		}
		logger.info("Heartbeat sent");
	}

	private async findJob(): Promise<Run | undefined> {
		const res = await this.sendAuthenticatedRequest(
			`${this.server}/api/agents/job/claim`,
		);

		if (!res.ok) {
			logger.error(`Job poll failed: ${await res.text()}`);
			return undefined;
		}

		if (res.status === 204) {
			logger.info("No jobs available");
			return undefined;
		}

		const run: Run = (await res.json()) as Run;
		logger.info({ run }, "Job acquired");
		return run;
	}

	private async updateJobStatus(
		runId: string,
		status: "running" | "passed" | "completed" | "failed",
	): Promise<void> {
		await retry(async () => {
			const res = await this.sendAuthenticatedRequest(
				`${this.server}/api/agents/job/${runId}`,
				{
					method: "POST",
					body: JSON.stringify({ status }),
				},
			);
			if (!res.ok) throw new Error(`Failed to update job ${runId} to ${status}`);
		});
	}

	private sendAuthenticatedRequest(
		url: string,
		init?: RequestInit,
	): Promise<Response> {
		return fetch(url, {
			...init,
			headers: {
				...init?.headers,
				Authorization: `Bearer ${this.token}`,
				"Content-Type": "application/json",
			},
		});
	}
}
