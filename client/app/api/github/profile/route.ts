import { NextResponse } from "next/server";
import { createGitHubClient } from "@/src/client/gitClient";
import { createClient } from "@/utils/supabase/server";
import { getGithubClient } from "@/utils/api/githubAuth";

export async function GET() {
	const result = await getGithubClient()
	if (!result.ok){
		return new Response(JSON.stringify({ error: result.error }), { status: 401 });
	}
	const { githubClient } = result;

	const profile = await githubClient.getProfile();

	return NextResponse.json(profile);
}
