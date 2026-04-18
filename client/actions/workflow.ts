import { getWorkflowForProject } from "@/src/client/workflow";
import { createClient as createServerClient } from "@/utils/supabase/server";
import type { Json } from "@mincy/shared";

export async function createWorkflow(projectId: string, workflow: Json) {
	const supabase = await createServerClient();
	const existing = await getWorkflowForProject(projectId);

	if (existing) {
		return existing;
	}

	const { error } = await supabase
		.from("Workflow")
		.insert({
			projectId,
			pipeline: workflow,
		})
		.single();

	if (error) {
		throw new Error(error.message);
	}
}

export async function getWorkflowWithId(workflowId: string | null) {
	if (!workflowId) {return undefined;}

	const supabase = await createServerClient();

	const { data, error } = await supabase
		.from("Workflow")
		.select(`
            id,
            projectId,
            jobs,
			environment
        `)
		.eq("id", workflowId)
		.single();

	if (error) {
		console.error("Error fetching workflow:", error.message);
		return undefined;
	}

	return data;
}
