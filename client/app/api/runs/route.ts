import { NextResponse } from "next/server";
import { parseBody } from "@/utils/api/helpers";
import { getSession } from "@/utils/api/getSession";
import { runWorkflowSchema, type ContextType } from "@/src/dto/runs";
import { createRun } from "@/actions/runs";
import { getGithubClient } from "@/utils/api/githubAuth";
import { getWorkflowWithId } from "@/actions/workflow";
import { getProjectById } from "@/actions/projects";

export async function POST(req: Request) {
	const result = await getSession();
	if (!result.ok) {
		return new Response(JSON.stringify({ error: result.error }), {
			status: 401,
		});
	}
	const { supabase } = result;
	const body = await parseBody(req, runWorkflowSchema);

	const project = await getProjectById(body.projectId);
	if (!project) {
		return new Response(JSON.stringify({ error: "Project not found" }), {
			status: 404,
		});
	}
	const workflow = await getWorkflowWithId(body.workflowId);
	if (!workflow) {
		return new Response(JSON.stringify({ error: "Workflow not found" }), {
			status: 404,
		});
	}

	const triggers = (workflow.jobs as any)?.triggers;
	console.log("Workflow triggers:", workflow);
	if (!triggers?.some((t: any) => t.type === body.triggerType && t.enabled)) {
		return new Response(
			JSON.stringify({ error: "Trigger type not enabled for this workflow" }),
			{ status: 400 },
		);
	}

	const { githubClient } = await getGithubClient();
	const repo = await githubClient.getRepo(project.org, project.name);
	const sha = await githubClient.getBranchHead(
		project.org,
		project.name,
		repo.default_branch,
	);

	const triggerContext: ContextType = {
		ref: repo.default_branch,
		sha,
		url: repo.html_url,
	};

	await createRun(
		supabase,
		project.id,
		workflow.id,
		body.triggerType,
		triggerContext,
	);

	return NextResponse.json({}, { status: 201 });
}
