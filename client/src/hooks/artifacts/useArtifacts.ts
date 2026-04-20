import { useQuery } from "@tanstack/react-query";
import { getArtifactsForRun } from "@/src/client/artifacts";

export function useRunArtifacts(runId: string) {
	return useQuery({
		queryKey: ["artifacts", runId],
		queryFn: () => getArtifactsForRun(runId),
		enabled: !!runId,
	});
}
