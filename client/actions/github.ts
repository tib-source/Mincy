"use server";

import { getGithubClient } from "@/utils/api/githubAuth";

export async function getGithubProfile() {
	const { githubClient } = await getGithubClient();
	return githubClient.getProfile();
}

export async function getGithubRepos() {
	const { githubClient } = await getGithubClient();
	return githubClient.getRepos();
}

export async function getGithubRepo(owner: string, repo: string) {
	const { githubClient } = await getGithubClient();
	return githubClient.getRepo(owner, repo);
}
