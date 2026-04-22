import type { Database, Tables } from "@mincy/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContextType, TriggerType } from "@/src/dto/runs";
import { createClient } from "@/utils/supabase/server";

type PipelineStatus = Database["public"]["Enums"]["PipelineStatus"];

export type RunWithProject = Tables<"PipelineRun"> & {
	Projects: Pick<Tables<"Projects">, "id" | "installation_id" | "org" | "name">;
};

export async function getRunById(runId: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("PipelineRun")
		.select("*")
		.eq("id", runId)
		.single();

	if (error) {
		throw new Error(error.message);
	}

	if (!data) {
		throw new Error("Run not found");
	}

	return data;
}

export async function createRun(
	client: SupabaseClient,
	projectId: string,
	workflowId: string,
	trigger: TriggerType,
	context: ContextType,
): Promise<Tables<"PipelineRun">> {
	const { data, error } = await client
		.from("PipelineRun")
		.insert({
			project_id: projectId,
			workflow_id: workflowId,
			agent_id: null,
			status: "pending",
			trigger_context: context,
			triggered_by: trigger,
		})
		.select()
		.single();

	if (error || !data) {
		throw new Error(error?.message ?? "Failed to create run");
	}

	return data as Tables<"PipelineRun">;
}

export async function setRunTriggerContext(
	client: SupabaseClient,
	runId: string,
	context: ContextType,
) {
	const { error } = await client
		.from("PipelineRun")
		.update({ trigger_context: context })
		.eq("id", runId);

	if (error) {
		throw new Error(error.message);
	}
}

export async function updateRunStatus(
	client: SupabaseClient,
	runId: string,
	status: PipelineStatus,
	opts: { isTerminal?: boolean } = {},
): Promise<RunWithProject | null> {
	const { data, error } = await client
		.from("PipelineRun")
		.update({
			status,
			...(opts.isTerminal && { finished_at: new Date().toISOString() }),
		})
		.eq("id", runId)
		.select("*, Projects(id, installation_id, org, name)")
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return (data as RunWithProject | null) ?? null;
}
