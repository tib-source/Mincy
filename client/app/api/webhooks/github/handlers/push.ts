import type { EmitterWebhookEvent } from "@octokit/webhooks";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadProjectContext } from "../lib/project";
import { createRunWithCheck } from "../lib/runWithCheck";
import { findTagTrigger } from "../lib/triggers";

type PushPayload = EmitterWebhookEvent<"push">["payload"];

export async function handlePush(client: SupabaseClient, payload: PushPayload) {
	if (!payload.ref.startsWith("refs/tags/")) {
		return;
	}

	const owner = payload.repository.owner?.login ?? "";
	const ctx = await loadProjectContext(client, owner, payload.repository.name);
	if (!ctx) {
		return;
	}

	if (!findTagTrigger(ctx.jobs.triggers)) {
		return;
	}

	await createRunWithCheck({
		client,
		project: ctx.project,
		workflow: ctx.workflow,
		trigger: "tag",
		context: {
			ref: payload.ref,
			sha: payload.after,
			tag: payload.ref.replace("refs/tags/", ""),
			sender: payload.sender?.login,
			url: payload.repository.html_url,
		},
	});
}
