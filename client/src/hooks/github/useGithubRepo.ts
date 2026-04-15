import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getGithubRepo } from "@/actions/github";
import type { GitHubRepo } from "@/src/client/gitClient";

export function useGithubRepo(owner?: string, repo?: string) {
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: ["github-repo", owner, repo],
		queryFn: () => getGithubRepo(owner!, repo!),
		enabled: !!owner && !!repo,
		initialData: () => {
			const cachedRepos = queryClient.getQueryData<GitHubRepo[]>(["github-repositories"]);
			return cachedRepos?.find(
				(r) => r.owner.login === owner && r.name === repo,
			);
		},
	});
}
