import { useQuery } from "@tanstack/react-query";

export function useGithubRepos() {
	return useQuery({
		queryKey: ["github-repositories"],
		queryFn: async () => {
			const res = await fetch("/api/github/repositories");
			if (!res.ok) throw new Error("Failed to fetch repositoires");
			return res.json();
		},
	});
}
