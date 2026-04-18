import { getProjectById } from "@/actions/projects";
import { validateAgentToken } from "@/utils/agents/validateAgentToken";
import { githubApp } from "@/utils/api/githubApp";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const agent = await validateAgentToken(request);
	if (!agent) {
		return NextResponse.json(
			{ message: "Invalid credentials" },
			{ status: 401 },
		);
	}

	const body = await request.json();
	const { projectId } = body;

	if (!projectId) {
		return NextResponse.json(
			{ message: "projectId is required" },
			{ status: 400 },
		);
	}

	try {
		const project = await getProjectById(projectId);

		let installationId = project.installation_id;

		// Fallback for projects created before installation_id was stored
		if (!installationId) {
			const { data: installation } = await githubApp.octokit.request(
				"GET /repos/{owner}/{repo}/installation",
				{ owner: project.org, repo: project.name },
			);
			installationId = installation.id;
		}

		const octokit = await githubApp.getInstallationOctokit(installationId);
		const { token } = (await octokit.auth({
			type: "installation",
		})) as { token: string };

		return NextResponse.json({ token }, { status: 200 });
	} catch (error) {
		console.error("Failed to mint installation token:", error);
		return NextResponse.json(
			{ message: "Failed to generate token" },
			{ status: 500 },
		);
	}
}

export const runtime = "nodejs";
