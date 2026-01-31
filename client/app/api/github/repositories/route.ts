import { NextResponse } from "next/server";
import { createGitHubClient } from "@/src/client/gitClient";
import { getGithubClient } from "@/utils/api/githubAuth";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
	const result = await getGithubClient();
	if (!result.ok) {
		return new Response(JSON.stringify({ error: result.error }), {
			status: 401,
		});
	}
	const { githubClient } = result;

	const profile = await githubClient.getRepos();

	return NextResponse.json(profile);
}
