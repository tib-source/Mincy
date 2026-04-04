import { validateAgentToken } from "@/utils/agents/validateAgentToken";
import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {

    const agent = await validateAgentToken(request);
    if (!agent) {
        return new Response(
            JSON.stringify({ message: "Invalid credentials" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }
    
    const supabase = await createClient();
    const jobId = request.nextUrl.searchParams.get("id");

    if (!jobId) {
        return new Response(
            JSON.stringify({ message: "Job ID is required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const { status } = await request.json();

    if (!status || !["passed", "completed", "failed"].includes(status)) {
        return new Response(
            JSON.stringify({ message: "Invalid request body" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const { error } = await supabase.from("PipelineRun").update({ status }).eq("id", jobId);
    if (error) {
        return new Response(
            JSON.stringify({ message: "Failed to update job status", error: error instanceof Error ? error.message : String(error) }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    return new Response(null, { status: 200 });
}