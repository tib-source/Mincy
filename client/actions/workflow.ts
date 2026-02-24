import { getWorkflowForProject } from "@/src/client/workflow";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { Json } from "@mincy/shared";

export async function createWorkflow(projectId: string, workflow: Json){
    

    const supabase = await createServerClient();
    
    const existing = await getWorkflowForProject(projectId)
    
    if (existing){
        return existing
    }

    const { data, error } = await supabase
        .from("Workflow")
        .insert({
          projectId,
          pipeline: workflow,

        })
        .single();

    if (error) {
		throw new Error(error.message);
	}

    console.log(data)
}