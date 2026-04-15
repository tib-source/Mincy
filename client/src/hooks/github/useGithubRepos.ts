import { useQuery } from "@tanstack/react-query";
import { getGithubRepos } from "@/actions/github";

export function useGithubRepos() {
	return useQuery({
		queryKey: ["github-repositories"],
		queryFn: getGithubRepos,
		staleTime: 5 * 60 * 1000,
	});
}
