import { useQuery } from "@tanstack/react-query";

export function useGithubProfile() {
	return useQuery({
		queryKey: ["github-profile"],
		queryFn: async () => {
			const res = await fetch("/api/github/profile");
			if (!res.ok) throw new Error("Failed to fetch profile");
			return res.json();
		},
	});
}
