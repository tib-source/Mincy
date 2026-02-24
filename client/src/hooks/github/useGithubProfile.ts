import { useQuery } from "@tanstack/react-query";
import { getGithubProfile } from "@/actions/github";

export function useGithubProfile() {
	return useQuery({
		queryKey: ["github-profile"],
		queryFn: getGithubProfile,
	});
}
