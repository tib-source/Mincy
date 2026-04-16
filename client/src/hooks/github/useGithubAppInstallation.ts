import { useQuery } from "@tanstack/react-query";
import { getGithubAppInstallation } from "@/actions/github";

export function useGithubAppInstallation() {
	return useQuery({
		queryKey: ["github-app-installation"],
		queryFn: getGithubAppInstallation,
	});
}
