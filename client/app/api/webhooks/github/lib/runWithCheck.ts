import type { Tables } from "@mincy/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createRun, setRunTriggerContext } from "@/actions/runs";
import type { ContextType, TriggerType } from "@/src/dto/runs";
import { createCheckRun } from "@/utils/api/githubChecks";
import { buildCheckOutput, runDetailsUrl } from "./checkOutput";

type CreateRunArgs = {
	client: SupabaseClient;
	project: Tables<"Projects">;
	workflow: Tables<"Workflow">;
	trigger: TriggerType;
	context: ContextType;
};

export async function createRunWithCheck({
	client,
	project,
	workflow,
	trigger,
	context,
}: CreateRunArgs): Promise<Tables<"PipelineRun">> {
	const run = await createRun(
		client,
		project.id,
		workflow.id,
		trigger,
		context,
	);

	if (!project.installation_id) {
		return run;
	}

	const detailsUrl = runDetailsUrl(project.id, run.id);

	try {
		const checkRun = await createCheckRun({
			installationId: project.installation_id,
			owner: project.org,
			repo: project.name,
			headSha: context.sha,
			externalId: run.id,
			detailsUrl,
			output: buildCheckOutput({
				project,
				runId: run.id,
				trigger,
				context,
				status: "queued",
			}),
		});

		await setRunTriggerContext(client, run.id, {
			...context,
			check_run_id: checkRun.id,
		});
	} catch (err) {
		console.error("Failed to create GitHub check run:", err);
	}

	return run;
}
