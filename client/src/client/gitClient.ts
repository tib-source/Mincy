type GithubClientOptions = {
	accessToken: string;
};

export function createGitHubClient({ accessToken }: GithubClientOptions) {
	const baseUrl = "https://api.github.com";

	async function request<T>(
		path: string,
		options: RequestInit = {},
	): Promise<T> {
		const res = await fetch(`${baseUrl}${path}`, {
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

		return res.json();
	}

	return {
		getProfile: () => request("/user"),
		getRepos: () => request("/user/repos?per_page=100"),
	};
}
