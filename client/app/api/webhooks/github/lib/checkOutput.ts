import type { Tables } from "@mincy/shared";
import type { ContextType, TriggerType } from "@/src/dto/runs";
import type {
	CheckRunConclusion,
	CheckRunOutput,
	CheckRunStatus,
} from "@/utils/api/githubChecks";

type BuildOutputArgs = {
	project: Pick<Tables<"Projects">, "id" | "org" | "name">;
	runId: string;
	trigger: TriggerType;
	context: ContextType;
	status: CheckRunStatus;
	conclusion?: CheckRunConclusion;
};

export function buildCheckOutput({
	project,
	runId,
	trigger,
	context,
	status,
	conclusion,
}: BuildOutputArgs): CheckRunOutput {
	const lines: string[] = [];
	const projectLabel = `${project.org}/${project.name}`;
	const projectUrl = absoluteUrl(`/projects/${project.id}`);
	const runUrl = absoluteUrl(`/projects/${project.id}/runs/${runId}`);

	lines.push(
		`**Project:** ${projectUrl ? `[${projectLabel}](${projectUrl})` : projectLabel}`, 
		`**Run:** ${runUrl ? `[${shortId(runId)}](${runUrl})` : shortId(runId)}`,
		`**Trigger:** ${formatTrigger(trigger, context)}`
	);

	if (context.sha) {
		const msg = firstLine(context.message);
		const shaText = `\`${shortSha(context.sha)}\``;
		lines.push(
			msg ? `**Commit:** ${shaText} ${msg}` : `**Commit:** ${shaText}`,
		);
	}

	if (context.sender) {
		lines.push(`**By:** ${context.sender}`);
	}

	return { title: titleFor(status, conclusion), summary: lines.join("\n") };
}

function titleFor(
	status: CheckRunStatus,
	conclusion?: CheckRunConclusion,
): string {
	switch (status) {
		case "queued":
			return "Queued on mincy";
		case "in_progress":
			return "Running on mincy";
		case "completed":
			return conclusion ? `Completed (${conclusion})` : "Completed";
	}
}

function formatTrigger(trigger: TriggerType, context: ContextType): string {
	switch (trigger) {
		case "commit":
			return context.branch ? `push to \`${context.branch}\`` : "push";
		case "pull_request":
			return context.pr_number
				? `pull request #${context.pr_number}`
				: "pull request";
		case "tag":
			return context.tag ? `tag \`${context.tag}\`` : "tag";
		case "manual":
			return "manual run";
		case "cron":
			return "scheduled run";
	}
}

function firstLine(s?: string): string {
	return s?.split("\n")[0]?.trim() ?? "";
}

function shortSha(sha: string): string {
	return sha.slice(0, 7);
}

function shortId(id: string): string {
	return id.slice(0, 8);
}

function absoluteUrl(path: string): string | undefined {
	const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
	if (!base) {
		return undefined;
	}
	return `${base}${path}`;
}

export function runDetailsUrl(
	projectId: string,
	runId: string,
): string | undefined {
	return absoluteUrl(`/projects/${projectId}/runs/${runId}`);
}
