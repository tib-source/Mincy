import type { Run } from "@mincy/shared";
import { logger } from "../..";
import type { Executor } from "../executors/executor";

export default class Agent {
	readonly id: string;
	readonly name: string;
	readonly capacity: number;
	readonly token: string;
	readonly workdir: string;
	readonly pollInterval: number = 3000;
	readonly server: string;
	readonly executor: Executor;
	private activeJobs: number = 0;
	private heartbeatId: NodeJS.Timeout | null = null;
	private jobPollId: NodeJS.Timeout | null = null;

	constructor(
		id: string,
		name: string,
		capacity: number,
		workdir: string,
		token: string,
		executor: Executor,
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
		const res = await this.sendAuthenticatedRequest(
			`${this.server}/api/agents/register`,
			{
				method: "POST",
			},
		);

		if (!res.ok) throw new Error("Agent failed to register");

		logger.info("Agent registered successfully");
		this.startHeartbeat();
		this.startJobPoll();
	}

	async execute(run: Run): Promise<void> {
		const exitCode = await this.executor.execute(run);
		const status = exitCode === 0 ? "passed" : "failed";
		await this.updateJobStatus(run.id, status);
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
		status: "passed" | "completed" | "failed",
	): Promise<void> {
		await this.sendAuthenticatedRequest(
			`${this.server}/api/agents/job/${runId}`,
			{
				method: "POST",
				body: JSON.stringify({ status }),
			},
		);
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
