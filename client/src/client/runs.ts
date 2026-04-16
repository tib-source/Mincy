import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@mincy/shared";

export type PipelineRun = Tables<"PipelineRun">;

export interface LogEntry {
	id: string;
	created_at: string;
	workflow_id: string;
	run_id: string | null;
	job_id: string | null;
	level: string | null;
	message: string | null;
	timestamp: string | null;
}

export async function getRunsForProject(
	projectId: string,
): Promise<PipelineRun[]> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("PipelineRun")
		.select("*")
		.eq("project_id", projectId)
		.order("created_at", { ascending: false });

	if (error) {
		throw new Error(error.message);
	}

	return data || [];
}

export async function getRunById(runId: string): Promise<PipelineRun> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("PipelineRun")
		.select("*")
		.eq("id", runId)
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return data;
}

export async function getRecentRuns(limit = 10): Promise<PipelineRun[]> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("PipelineRun")
		.select("*")
		.order("created_at", { ascending: false })
		.limit(limit);

	if (error) {
		throw new Error(error.message);
	}

	return data || [];
}

export async function getRecentRunsForProject(
	projectId: string,
	limit = 1,
): Promise<PipelineRun[]> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("PipelineRun")
		.select("*")
		.eq("project_id", projectId)
		.order("created_at", { ascending: false })
		.limit(limit);

	if (error) {
		throw new Error(error.message);
	}

	return data || [];
}

export async function getLogsForRun(runId: string): Promise<LogEntry[]> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("Logs")
		.select("*")
		.eq("run_id", runId)
		.order("timestamp", { ascending: true });

	if (error) {
		throw new Error(error.message);
	}

	return data as unknown as LogEntry[];
}
