import { NextResponse } from "next/server";
import { createProjectSchema } from "@/src/dto/project";
import { parseBody } from "@/utils/api/helpers";
import { getSession } from "@/utils/api/getSession";
import { BASE_WORKFLOW } from "@/utils/constants";
import { createWorkflow } from "@/actions/workflow";

export async function POST(req: Request) {
	const result = await getSession();
	if (!result.ok) {
		return new Response(JSON.stringify({ error: result.error }), {
			status: 401,
		});
	}
	const { supabase } = result;
	const body = await parseBody(req, createProjectSchema);

	const { data: existing } = await supabase
		.from("Projects")
		.select("org")
		.eq("name", body.name)
		.maybeSingle();

	if (existing?.org === body.org) {
		return NextResponse.json(
			{ message: "Project already exists" },
			{ status: 400 },
		);
	}

	const user = await supabase.auth.getUser();
	const { data: newProject, error } = await supabase.from("Projects").insert({
		...body,
		user_id: user.data.user?.id,
	}).select().single();

	if (error) {
		console.log(error);
		return new Response(JSON.stringify({ error }), { status: 400 });
	}
	
	createWorkflow(newProject.id, BASE_WORKFLOW)

	return NextResponse.json({}, { status: 201 });
}
