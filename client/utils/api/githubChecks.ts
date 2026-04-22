import type { JobStatus } from "@mincy/shared";
import { githubApp } from "./githubApp";

export type CheckRunStatus = "queued" | "in_progress" | "completed";

export type CheckRunConclusion =
	| "success"
	| "failure"
	| "cancelled"
	| "skipped"
	| "timed_out"
	| "action_required"
	| "neutral"
	| "stale";

export const CHECK_RUN_NAME = "mincy CI";

export type CheckRunOutput = {
	title: string;
	summary: string;
};

export type CheckRunTarget = {
	installationId: number;
	owner: string;
	repo: string;
};

type CreateCheckRunParams = CheckRunTarget & {
	headSha: string;
	externalId: string;
	detailsUrl?: string;
	name?: string;
	output?: CheckRunOutput;
};

export async function createCheckRun(params: CreateCheckRunParams) {
	const octokit = await githubApp.getInstallationOctokit(params.installationId);
	const { data } = await octokit.request(
		"POST /repos/{owner}/{repo}/check-runs",
		{
			owner: params.owner,
			repo: params.repo,
			name: params.name ?? CHECK_RUN_NAME,
			head_sha: params.headSha,
			external_id: params.externalId,
			status: "queued",
			details_url: params.detailsUrl,
			output: params.output,
		},
	);
	return data;
}

type UpdateCheckRunParams = CheckRunTarget & {
	checkRunId: number;
	status?: CheckRunStatus;
	conclusion?: CheckRunConclusion;
	detailsUrl?: string;
	output?: CheckRunOutput;
};

export async function updateCheckRun(params: UpdateCheckRunParams) {
	const octokit = await githubApp.getInstallationOctokit(params.installationId);
	await octokit.request(
		"PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}",
		{
			owner: params.owner,
			repo: params.repo,
			check_run_id: params.checkRunId,
			status: params.status,
			conclusion: params.conclusion,
			details_url: params.detailsUrl,
			output: params.output,
			...(params.status === "completed" && {
				completed_at: new Date().toISOString(),
			}),
		},
	);
}

export function checkStateForJobStatus(status: JobStatus): {
	status: CheckRunStatus;
	conclusion?: CheckRunConclusion;
} {
	switch (status) {
		case "queued":
			return { status: "queued" };
		case "running":
			return { status: "in_progress" };
		case "passed":
			return { status: "completed", conclusion: "success" };
		case "failed":
			return { status: "completed", conclusion: "failure" };
		case "completed":
			return { status: "completed", conclusion: "neutral" };
	}
}
