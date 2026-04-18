import { useQuery } from "@tanstack/react-query";
import {
	getRunsForProject,
	getRunById,
	getLogsForRun,
	getRecentRuns,
	getRecentRunsForProject,
	type PipelineRun,
} from "@/src/client/runs";

const ACTIVE_STATUSES = new Set<PipelineRun["status"]>([
	"queued",
	"running",
	"pending",
]);

const ACTIVE_POLL_MS = 2_000;
const LIST_POLL_MS = 5_000;

const isActiveStatus = (status: PipelineRun["status"] | undefined) =>
	status !== undefined && ACTIVE_STATUSES.has(status);

export function useProjectRuns(projectId?: string) {
	return useQuery({
		queryKey: ["runs", projectId],
		queryFn: () => getRunsForProject(projectId!),
		enabled: !!projectId,
		refetchIntervalInBackground: false,
		refetchInterval: (query) => {
			const runs = query.state.data;
			return runs?.some((r) => isActiveStatus(r.status))
				? LIST_POLL_MS
				: false;
		},
	});
}

export function useRun(runId?: string) {
	return useQuery({
		queryKey: ["run", runId],
		queryFn: () => getRunById(runId!),
		enabled: !!runId,
		refetchIntervalInBackground: false,
		refetchInterval: (query) =>
			isActiveStatus(query.state.data?.status) ? ACTIVE_POLL_MS : false,
	});
}

export function useRunLogs(runId?: string, runStatus?: PipelineRun["status"]) {
	return useQuery({
		queryKey: ["run-logs", runId],
		queryFn: () => getLogsForRun(runId!),
		enabled: !!runId,
		refetchIntervalInBackground: false,
		refetchInterval: isActiveStatus(runStatus) ? ACTIVE_POLL_MS : false,
	});
}

export function useRecentRuns(limit = 10) {
	return useQuery({
		queryKey: ["recent-runs", limit],
		queryFn: () => getRecentRuns(limit),
		refetchIntervalInBackground: false,
		refetchInterval: (query) => {
			const runs = query.state.data;
			return runs?.some((r) => isActiveStatus(r.status))
				? LIST_POLL_MS
				: false;
		},
	});
}

export function useRecentProjectRuns(projectId: string, limit = 1) {
	return useQuery({
		queryKey: ["recent-runs", projectId, limit],
		queryFn: () => getRecentRunsForProject(projectId, limit),
	});
}
