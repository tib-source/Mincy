import { NextResponse } from "next/server";
import { parseBody } from "@/utils/api/helpers";
import { getSession } from "@/utils/api/getSession";
import { runWorkflowSchema } from "@/src/dto/runs";
import { createRun } from "@/actions/runs";

export async function POST(req: Request) {
	const result = await getSession();
	if (!result.ok) {
		return new Response(JSON.stringify({ error: result.error }), {
			status: 401,
		});
	}
	const { supabase } = result;
	const body = await parseBody(req, runWorkflowSchema);

	const {error } = await createRun(supabase, body.projectId,body.workflowId, body.triggerType, body.triggerContext);
	if (error) {
		console.error("Error creating run:", error);
		return new Response(JSON.stringify({ error }), { status: 400 });
	}

	return NextResponse.json({}, { status: 201 });
}
