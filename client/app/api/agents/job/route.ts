import { getProjectById } from "@/actions/projects";
import { getWorkflowWithId } from "@/actions/workflow";
import { validateAgentToken } from "@/utils/agents/validateAgentToken";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const agent = await validateAgentToken(request);

    if (!agent) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("claim_next_job", { p_agent_id: agent.id });

    if (error) {
        console.error(error);
        return NextResponse.json({ error }, { status: 400 });
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
        return new NextResponse(null, { status: 204 });
    }

    const job = data[0];
    const [project, workflow] = await Promise.all([
        getProjectById(job.project_id ?? ""),
        getWorkflowWithId(job.workflow_id),
    ]);

    return NextResponse.json({ ...job, workflow, project }, { status: 200 });
}