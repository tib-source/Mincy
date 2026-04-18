import { useQuery } from "@tanstack/react-query";
import {
	getRunsForProject,
	getRunById,
	getLogsForRun,
	getRecentRuns,
	getRecentRunsForProject,
} from "@/src/client/runs";

export function useProjectRuns(projectId?: string) {
	return useQuery({
		queryKey: ["runs", projectId],
		queryFn: () => getRunsForProject(projectId!),
		enabled: !!projectId,
		refetchInterval: 1000,
	});
}

export function useRun(runId?: string) {
	return useQuery({
		queryKey: ["run", runId],
		queryFn: () => getRunById(runId!),
		enabled: !!runId,
		refetchInterval: 1000,
	});
}

export function useRunLogs(runId?: string) {
	return useQuery({
		queryKey: ["run-logs", runId],
		queryFn: () => getLogsForRun(runId!),
		enabled: !!runId,
		refetchInterval: 1000,
	});
}

export function useRecentRuns(limit = 10) {
	return useQuery({
		queryKey: ["recent-runs", limit],
		queryFn: () => getRecentRuns(limit),
		refetchInterval: 10_000,
	});
}

export function useRecentProjectRuns(projectId: string, limit = 1) {
	return useQuery({
		queryKey: ["recent-runs", projectId, limit],
		queryFn: () => getRecentRunsForProject(projectId, limit),
	});
}
