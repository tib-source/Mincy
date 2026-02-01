import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getGithubProfile, getGithubRepo, getGithubRepos } from "@/actions/github";

export function useGithubProfile() {
	return useQuery({
		queryKey: ["github-profile"],
		queryFn: getGithubProfile,
	});
}

export function useGithubRepos() {
	return useQuery({
		queryKey: ["github-repositories"],
		queryFn: getGithubRepos,
	});
}

export function useGithubRepo(owner: string, repo: string){
    return useSuspenseQuery({
        queryKey: [`github-${owner}-${repo}`],
        queryFn: () =>  getGithubRepo(owner, repo),
    }, )
}