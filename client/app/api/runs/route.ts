import { NextResponse } from "next/server";
import { parseBody } from "@/utils/api/helpers";
import { getSession } from "@/utils/api/getSession";
import { runWorkflowSchema } from "@/src/dto/workflow";

export async function POST(req: Request) {
    const result = await getSession();
    if (!result.ok) {
        return new Response(JSON.stringify({ error: result.error }), {
            status: 401,
        });
    }
    const { supabase } = result;
    const body = await parseBody(req, runWorkflowSchema);


    const { error } = await supabase.from("PipelineRun").insert({
        project_id: body.projectId,
        workflow_id: body.workflowId,
        agent_id: null,
        logs: null,
        status: "pending"
    })

    if (error) {
        return new Response(JSON.stringify({ error }), { status: 400 });
    }

    return NextResponse.json({}, { status: 201 });
}
