import { NextResponse } from "next/server";
import { createGitHubClient } from "@/src/client/gitClient";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
	const supabase = await createClient();

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.provider_token) {
		return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
	}

	const githubClient = createGitHubClient({
		accessToken: session.provider_token,
	});

	const profile = await githubClient.getProfile();

	return NextResponse.json(profile);
}
