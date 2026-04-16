"use server";

import { redirect } from "next/navigation";
import {
	getGithubClient,
	GitHubTokenExpiredError,
} from "@/utils/api/githubAuth";
import { getSecret } from "@/utils/api/secrets";
import { GITHUB_SECRET_NAMES } from "@/utils/api/secretNames";
import { createClient } from "@/utils/supabase/server";

async function withGithubClient<T>(
	fn: (
		client: Awaited<ReturnType<typeof getGithubClient>>["githubClient"],
	) => Promise<T>,
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

export type GithubAppInstallation = {
	id: number;
	account: {
		login: string;
		avatar_url: string;
	};
	html_url: string;
	app_slug: string;
	target_type: string;
	repository_selection: string;
};

export type GithubInstallationStatus =
	| { installed: true; installation: GithubAppInstallation }
	| { installed: false };

export async function getGithubAppInstallation(): Promise<GithubInstallationStatus> {
	const supabase = await createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		return { installed: false };
	}

	let accessToken = session.provider_token;
	if (!accessToken) {
		accessToken = await getSecret(GITHUB_SECRET_NAMES.ACCESS_TOKEN);
	}
	if (!accessToken) {
		return { installed: false };
	}

	try {
		const res = await fetch("https://api.github.com/user/installations", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github+json",
			},
		});

		if (!res.ok) {
			return { installed: false };
		}

		const data = await res.json();
		const appId = process.env.GITHUB_APP_ID;

		const installation = data.installations?.find(
			(inst: any) => String(inst.app_id) === appId,
		);

		if (installation) {
			return {
				installed: true,
				installation: {
					id: installation.id,
					account: {
						login: installation.account.login,
						avatar_url: installation.account.avatar_url,
					},
					html_url: installation.html_url,
					app_slug: installation.app_slug,
					target_type: installation.target_type,
					repository_selection: installation.repository_selection,
				},
			};
		}

		return { installed: false };
	} catch {
		return { installed: false };
	}
}
