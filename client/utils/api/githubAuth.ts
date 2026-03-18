import { createGitHubClient } from "@/src/client/gitClient";
import { createClient } from "../supabase/server";
import { getSecret } from "./secrets";

export class GitHubTokenExpiredError extends Error {
	constructor() {
		super("GitHub token has expired. Please re-authenticate.");
		this.name = "GitHubTokenExpiredError";
	}
}

async function validateGitHubToken(token: string): Promise<boolean> {
	const res = await fetch("https://api.github.com/user", {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/vnd.github+json",
		},
	});
	return res.ok;
}

export async function getGithubClient() {
	const supabase = await createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("Not authenticated");
	}

	// Try the session's provider_token first (available right after login),
	// then fall back to the encrypted token from the secrets store
	let accessToken = session.provider_token;

	if (!accessToken) {
		accessToken = await getSecret("github_access_token");
	}

	if (!accessToken) {
		throw new GitHubTokenExpiredError();
	}

	// Validate the token is still good with GitHub
	const isValid = await validateGitHubToken(accessToken);
	if (!isValid) {
		throw new GitHubTokenExpiredError();
	}

	return {
		githubClient: createGitHubClient({ accessToken }),
	};
}
