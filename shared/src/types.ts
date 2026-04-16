import type { Tables } from "./database.types";

export type Run = {
	workflow: {
		id: string;
		projectId: string;
		jobs: JobDefinition;
	};
	project: Tables<"Projects">;
} & Tables<"PipelineRun">;

export interface Step {
	id: string;
	type?: string;
	data: Record<string, unknown>;
	status: JobStatus;
	dependsOn: string[];
	next: string[];
}

export interface Stage {
	id: string;
	name: string;
	image: string;
	steps: Step[];
	dependsOn: string[];
}

export type TriggerType =
	| "manual"
	| "commit"
	| "schedule"
	| "webhook"
	| "tag"
	| "pull_request";

export interface BaseTriggerConfig {
	type: TriggerType;
	enabled: boolean;
}

export interface ManualTriggerConfig extends BaseTriggerConfig {
	type: "manual";
}

export interface ScheduledTriggerConfig extends BaseTriggerConfig {
	type: "schedule";
	cronSchedule: string;
}

export interface CommitTriggerConfig extends BaseTriggerConfig {
	type: "commit";
	branches: string[];
}

export type TriggerConfig =
	| ManualTriggerConfig
	| ScheduledTriggerConfig
	| CommitTriggerConfig;

export interface JobDefinition {
	stages: Stage[];
	triggers: TriggerConfig[];
	source_hash: string;
	calculated_at: string;
}

export interface Workflow {
	id: number;
	project_id: number;
	environment?: JSON;
	jobs: JobDefinition;
}

export type JobStatus =
	| "queued"
	| "running"
	| "passed"
	| "failed"
	| "completed";
