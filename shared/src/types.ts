import type { LogEvent } from "pino";


export interface Job {
	id: string;
	type?: string;
	config: any;
	dependsOn: string[];
	next: string[];
}

export interface Workflow {
	id: number;
	project_id: number;
	jobs: Job[];
	environment?: JSON;
}
