import { createProjectSchema } from "@/src/dto/project";
import { getGithubClient } from "@/utils/api/githubAuth";
import { parseBody } from "@/utils/api/helpers";
import { NextResponse } from "next/server";

export async function POST( req: Request) {
	const result = await getGithubClient()
	if (!result.ok){
		return new Response(JSON.stringify({ error: result.error }), { status: 401 });
	}
	const { githubClient, supabase } = result;
	const body = await parseBody(req, createProjectSchema)


	const { data: existing } = await supabase
	.from("Projects")
	.select("org")
	.eq("name", body.name)
	.maybeSingle();

	if (existing?.org == body.org) {
	return NextResponse.json({ error: "Project already exists" }, { status: 400 });
	}

	const user =  await supabase.auth.getUser()
	const { error } = await supabase.from("Projects").insert({
		...body, 
		user_id : user.data.user?.id
	})

	if (error){ 
		console.log(error)
		return new Response(JSON.stringify({ error }), { status: 400 });
	}

	return NextResponse.json({}, { status: 201})
}
