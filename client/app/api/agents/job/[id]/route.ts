import { validateAgentToken } from "@/utils/agents/validateAgentToken";
import { createClient } from "@/utils/supabase/server";
import { JobStatus } from "@mincy/shared";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const agent = await validateAgentToken(request);
	if (!agent) {
		return new Response(JSON.stringify({ message: "Invalid credentials" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const supabase = await createClient();
	const { id } = await params;
	const { status } = await request.json();

	console.log("Updating job status for job ID:", id);
	console.log("Request body:", { status });
	if (!id) {
		return new Response(JSON.stringify({ message: "Job ID is required" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}


	const validStatuses: JobStatus[] = ["running", "passed", "failed", "completed"];

	if (!status || !validStatuses.includes(status)) {
		return new Response(JSON.stringify({ message: "Invalid request body" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const isTerminal = status === "passed" || status === "failed" || status === "completed";
	const { error } = await supabase
		.from("PipelineRun")
		.update({
			status,
			...(isTerminal && { finished_at: new Date().toISOString() }),
		})
		.eq("id", id);
	if (error) {
		return new Response(
			JSON.stringify({
				message: "Failed to update job status",
				error: error instanceof Error ? error.message : String(error),
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}

	return new Response(null, { status: 200 });
}
