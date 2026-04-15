import { createGitHubClient } from "@/src/client/gitClient";
import { createClient } from "../supabase/server";
import { getSecret } from "./secrets";
import { GITHUB_SECRET_NAMES } from "./secretNames";

export class GitHubTokenExpiredError extends Error {
	constructor() {
		super("GitHub token has expired. Please re-authenticate.");
		this.name = "GitHubTokenExpiredError";
	}
}

export async function getGithubClient() {
	const supabase = await createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("Not authenticated");
	}

	let accessToken = session.provider_token;

	if (!accessToken) {
		throw new GitHubTokenExpiredError();
	}

	return {
		githubClient: createGitHubClient({ accessToken }),
	};
}
