import type { TriggerConfig } from "@mincy/shared";
import type { EmitterWebhookEvent } from "@octokit/webhooks";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContextType, TriggerType } from "@/src/dto/runs";
import { loadProjectContext } from "../lib/project";
import { createRunWithCheck } from "../lib/runWithCheck";
import { findCommitTrigger, findPullRequestTrigger } from "../lib/triggers";

type CheckSuitePayload = EmitterWebhookEvent<
	"check_suite.requested" | "check_suite.rerequested"
>["payload"];
type CheckSuite = CheckSuitePayload["check_suite"];
type PullRequests = CheckSuite["pull_requests"];

export async function handleCheckSuite(
	client: SupabaseClient,
	payload: CheckSuitePayload,
) {
	const owner = payload.repository.owner?.login ?? "";
	const ctx = await loadProjectContext(client, owner, payload.repository.name);
	if (!ctx) return;

	const suite = payload.check_suite;
	const pullRequests = suite.pull_requests ?? [];
	const match = matchTrigger(ctx.jobs.triggers, suite, pullRequests);
	if (!match) return;

	await createRunWithCheck({
		client,
		project: ctx.project,
		workflow: ctx.workflow,
		trigger: match.trigger,
		context: match.context,
	});
}

type MatchResult = { trigger: TriggerType; context: ContextType };

function matchTrigger(
	triggers: TriggerConfig[],
	suite: CheckSuite,
	pullRequests: PullRequests,
): MatchResult | null {
	const pr = pullRequests[0];
	const branch = suite.head_branch ?? pr?.head.ref;
	const baseContext = {
		sha: suite.head_sha,
		sender: suite.head_commit?.author?.name,
		message: suite.head_commit?.message ?? undefined,
		...(pr && { pr_number: pr.number }),
	};

	if (pr) {
		const prTrigger = findPullRequestTrigger(triggers, pr.base.ref);
		if (prTrigger) {
			return {
				trigger: "pull_request",
				context: {
					...baseContext,
					ref: `refs/heads/${pr.head.ref}`,
					branch: pr.head.ref,
				},
			};
		}
	}

	if (branch && findCommitTrigger(triggers, branch)) {
		return {
			trigger: "commit",
			context: {
				...baseContext,
				ref: `refs/heads/${branch}`,
				branch,
			},
		};
	}

	return null;
}
