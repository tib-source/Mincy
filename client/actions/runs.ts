import { ContextType, runContextSchema, TriggerType } from "@/src/dto/runs";
import { createClient } from "@/utils/supabase/server";


export async function getRunById(runId: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from("PipelineRun")
        .select("*")
        .eq("id", runId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    if (!data) {
        throw new Error("Run not found");
    }

    return data;
}

export async function createRun(client: any, projectId: string, workflowId: string, trigger: TriggerType, context: ContextType) {
    
    const { error } = await client
        .from("PipelineRun")
        .upsert({
            project_id: projectId,
            workflow_id: workflowId,
            agent_id: null,
            status: "pending",
            trigger_context: context,
            triggered_by: trigger,
        })
        .single();

    if (error) {
        console.error("Error creating run:", error);
        throw new Error(error.message);
    }


}
