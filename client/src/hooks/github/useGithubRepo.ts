import { useQuery } from "@tanstack/react-query";
import { getGithubRepo } from "@/actions/github";

export function useGithubRepo(owner: string, repo: string) {
	return useQuery({
		queryKey: [`github-${owner}-${repo}`],
		queryFn: () => getGithubRepo(owner, repo),
	});
}
