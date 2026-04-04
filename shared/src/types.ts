import { Tables } from "./database.types";


export type Run =  {
	workflow : {
        id: string;
        projectId: string;
        jobs: JobDefinition
    },
	project: Tables<'Projects'>
} & Tables<"PipelineRun">


export interface Step {
	id: string;
	type?: string;
	data: Record<string, unknown>;
	status: string;
	dependsOn: string[];
	next: string[];
}

export interface JobDefinition {
  steps: Step[];
  source_hash: string;
  calculated_at: string;
}


export interface Workflow {
	id: number;
	project_id: number;
	environment?: JSON;
	jobs: JobDefinition;
}
