import { NextResponse } from "next/server";
import { parseBody } from "@/utils/api/helpers";
import { getSession } from "@/utils/api/getSession";
import { createWorkflowSchema } from "@/src/dto/workflow";

export async function POST(req: Request) {
	const result = await getSession();
	if (!result.ok) {
		return new Response(JSON.stringify({ error: result.error }), {
			status: 401,
		});
	}
	const { supabase } = result;
	const body = await parseBody(req, createWorkflowSchema);

	const { error } = await supabase.from("Workflow").insert({
		...body,
	});

	if (error) {
		console.log(error);
		return new Response(JSON.stringify({ error }), { status: 400 });
	}

	return NextResponse.json({}, { status: 201 });
}
