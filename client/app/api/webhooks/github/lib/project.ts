import type { JobDefinition, Tables } from "@mincy/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getProjectWithWorkflowByRepo } from "@/actions/projects";

export type ProjectContext = {
	project: Tables<"Projects">;
	workflow: Tables<"Workflow">;
	jobs: JobDefinition;
};

export async function loadProjectContext(
	client: SupabaseClient,
	owner: string,
	name: string,
): Promise<ProjectContext | null> {
	const result = await getProjectWithWorkflowByRepo(client, owner, name);
	if (!result) return null;
	const jobs = result.workflow.jobs as JobDefinition | null;
	if (!jobs) return null;
	return { project: result.project, workflow: result.workflow, jobs };
}
