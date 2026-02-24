import { createClient } from "@/utils/supabase/client";
import type { Json, Tables } from "@mincy/shared";


export async function getWorkflowForProject(projectId: string): Promise<Tables<"Workflow"> | undefined>{
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("Workflow")
        .select("*")
        .eq("projectId", projectId)
        .maybeSingle();

    if (error) {
		throw new Error(error.message);
	}

    return data || undefined
}


export async function updateWorkflow(projectId: string, workflow: object){
    const supabase = await createClient()
    const existing = await getWorkflowForProject(projectId)

    if(!existing){
        throw new Error("Workflow not found for this project")
    }

    const { error } = await supabase
    .from("Workflow")
    .update({
        pipeline: workflow
    })
    .eq("projectId", projectId )

    if (error)
        throw new Error(error.message)
}