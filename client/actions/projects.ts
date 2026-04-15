import { createClient } from "@/utils/supabase/server";
import type { Tables } from "@mincy/shared";

export async function getProjectById(
	projectId: string,
): Promise<Tables<"Projects">> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("Projects")
		.select("*")
		.eq("id", projectId)
		.single();

	if (error) {
		throw new Error(error.message);
	}

	if (!data) {
		throw new Error("Project not found");
	}

	return data;
}

type ProjectWithWorkflow = {
	project: Tables<"Projects">;
	workflow: Tables<"Workflow">;
};


export async function getProjectWithWorkflowByRepo(
	client: any,
	org: string,
	name: string,
): Promise<ProjectWithWorkflow | null> {
	const { data, error } = await client
		.from("Projects")
		.select("*, Workflow(*)")
		.eq("name", name)
		.eq("org", org)
		.single();

	if (error || !data) {return null;}

	const workflow = data.Workflow?.[0];
	return workflow ? { project: data, workflow } : null;
}
