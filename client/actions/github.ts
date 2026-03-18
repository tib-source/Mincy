"use server";

import { redirect } from "next/navigation";
import {
	getGithubClient,
	GitHubTokenExpiredError,
} from "@/utils/api/githubAuth";

async function withGithubClient<T>(
	fn: (client: Awaited<ReturnType<typeof getGithubClient>>["githubClient"]) => Promise<T>,
): Promise<T> {
	try {
		const { githubClient } = await getGithubClient();
		return await fn(githubClient);
	} catch (err) {
		if (
			err instanceof GitHubTokenExpiredError ||
			(err instanceof Error && err.message === "Bad credentials")
		) {
			redirect("/login");
		}
		throw err;
	}
}

export async function getGithubProfile() {
	return withGithubClient((client) => client.getProfile());
}

export async function getGithubRepos() {
	return withGithubClient((client) => client.getRepos());
}

export async function getGithubRepo(owner: string, repo: string) {
	return withGithubClient((client) => client.getRepo(owner, repo));
}
