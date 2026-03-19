import type { Job, Tables } from "@mincy/shared";
import { logger } from "../..";
import type { Executor } from "../executors/executor";

export type Run =  {
	workflow : Job[],
	project: Tables<'Projects'>
} & Tables<"PipelineRun">

export default class Agent {
    readonly id: string;
    readonly name: string;
    readonly capacity: number;
    readonly token: string;
    readonly workdir: string;
    readonly server: string = "localhost:3000";
    readonly pollInterval: number = 3000;

    private executor: Executor;
    private heartbeatId: NodeJS.Timeout | null = null;
    private jobPollId: NodeJS.Timeout | null = null;

    constructor(
        id: string,
        name: string,
        capacity: number,
        workdir: string,
        token: string,
        executor: Executor,
    ) {
        this.id = id;
        this.name = name;
        this.capacity = capacity;
        this.workdir = workdir;
        this.token = token;
        this.executor = executor;
    }

    async register(): Promise<void> {
        const res = await this.sendAuthenticatedRequest(`${this.server}/api/agents/register`, {
            method: "POST",
        });

        if (!res.ok) throw new Error("Agent failed to register");

        logger.info("Agent registered successfully");
        this.startHeartbeat();
        this.startJobPoll();
    }

    async execute(run: Run): Promise<void> {
        await this.executor.execute(run);
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
            const run = await this.findJob();
            if (run) await this.execute(run);
        }, this.pollInterval);
    }

    private async heartbeat(): Promise<void> {
        const res = await this.sendAuthenticatedRequest(`${this.server}/api/agents/heartbeat`);
        if (!res.ok) {
            logger.warn("Failed to send heartbeat");
            return;
        }
        logger.info("Heartbeat sent");
    }

    private async findJob(): Promise<Run | undefined> {
        const res = await this.sendAuthenticatedRequest(`${this.server}/api/agents/job`);

        if (!res.ok) {
            logger.error(`Job poll failed: ${await res.text()}`);
            return undefined;
        }

        if (res.status === 204) {
            logger.info("No jobs available");
            return undefined;
        }

        const run: Run = await res.json();
        logger.info({ run }, "Job acquired");
        return run;
    }

    private sendAuthenticatedRequest(url: string, init?: RequestInit): Promise<Response> {
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