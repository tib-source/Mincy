import type { Run } from "@mincy/shared";

export interface JobContext {
	workflowId: string;
	jobId: string;
	runId: string;
}

export interface Executor {
	execute: (workflow: Run) => Promise<number>;
}
