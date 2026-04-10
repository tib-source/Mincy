import { useQuery } from "@tanstack/react-query";
import {
	getRunsForProject,
	getRunById,
	getLogsForRun,
	getRecentRuns,
} from "@/src/client/runs";

export function useProjectRuns(projectId?: string) {
	return useQuery({
		queryKey: ["pipeline-runs", projectId],
		queryFn: () => getRunsForProject(projectId!),
		enabled: !!projectId,
		refetchInterval: 5000,
	});
}

export function useRun(runId?: string) {
	return useQuery({
		queryKey: ["pipeline-run", runId],
		queryFn: () => getRunById(runId!),
		enabled: !!runId,
		refetchInterval: 5000,
	});
}

export function useRunLogs(runId?: string) {
	return useQuery({
		queryKey: ["run-logs", runId],
		queryFn: () => getLogsForRun(runId!),
		enabled: !!runId,
		refetchInterval: 3000,
	});
}

export function useRecentRuns(limit = 10) {
	return useQuery({
		queryKey: ["recent-runs", limit],
		queryFn: () => getRecentRuns(limit),
		refetchInterval: 10_000,
	});
}
