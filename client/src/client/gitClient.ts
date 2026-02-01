type GithubClientOptions = {
	accessToken: string;
};

export type GitHubUser = {
	id: number;
	login: string;
	name: string | null;
	avatar_url: string;
	html_url: string;
};

export type GitHubRepo = {
	id: number;
	name: string;
	full_name: string;
	private: boolean;
	html_url: string;
	description: string | null;
	clone_url: string;
	created_at: string;
	owner: {
		login: string;
		avatar_url: string;
	};
	git_url: string;
	pushed_at: string;
};


export function createGitHubClient({ accessToken }: GithubClientOptions) {
	const baseUrl = "https://api.github.com";

	async function request<T>(
		path: string,
		options: RequestInit = {},
	): Promise<T> {

		let url = `${baseUrl}${path}`;
		let results: unknown[] = [];


		while (true) {
			const res = await fetch(url, {
				...options,
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: "application/vnd.github+json",
					...options.headers,
				},
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message ?? "GitHub API error");
			}

			const data = await res.json();

			if (Array.isArray(data)) {
				results.push(...data);

				const link = res.headers.get("Link");
				const next = link?.match(/<(.+?)>;\s*rel="next"/)?.[1];

				if (!next) break;

				url = next;
			} else {
				return data as T;
			}
		}

		return results as T;
	}

	return {
		getProfile: () => request<GitHubUser>("/user"),

		getRepos: () =>
			request<GitHubRepo[]>("/user/repos?per_page=100"),

		getRepo: (owner: string, repo: string) =>
			request<GitHubRepo>(`/repos/${owner}/${repo}`),
	};
}
