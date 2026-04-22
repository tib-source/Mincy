import type { EmitterWebhookEvent } from "@octokit/webhooks";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getRunById } from "@/actions/runs";
import type { ContextType, TriggerType } from "@/src/dto/runs";
import { loadProjectContext } from "../lib/project";
import { createRunWithCheck } from "../lib/runWithCheck";

type CheckRunRerequestedPayload =
	EmitterWebhookEvent<"check_run.rerequested">["payload"];

export async function handleCheckRunRerequest(
	client: SupabaseClient,
	payload: CheckRunRerequestedPayload,
) {
	const externalId = payload.check_run.external_id;
	if (!externalId) {
		return;
	}

	const priorRun = await safeGetRun(externalId);
	if (!priorRun) {
		return;
	}

	const owner = payload.repository.owner?.login ?? "";
	const ctx = await loadProjectContext(client, owner, payload.repository.name);
	if (!ctx) {
		return;
	}

	const priorContext = (priorRun.trigger_context ?? {}) as ContextType;
	const trigger: TriggerType = priorRun.triggered_by ?? "manual";

	await createRunWithCheck({
		client,
		project: ctx.project,
		workflow: ctx.workflow,
		trigger,
		context: {
			...priorContext,
			sha: payload.check_run.head_sha,
			check_run_id: undefined,
		},
	});
}

async function safeGetRun(id: string) {
	try {
		return await getRunById(id);
	} catch {
		return null;
	}
}
