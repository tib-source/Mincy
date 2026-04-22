import type {
	CommitTriggerConfig,
	PullRequestTriggerConfig,
	TagTriggerConfig,
	TriggerConfig,
} from "@mincy/shared";

export function matchBranch(pattern: string, branch: string): boolean {
	const regex = new RegExp(`^${pattern.replaceAll("*", ".*")}$`);
	return regex.test(branch);
}

export function findCommitTrigger(
	triggers: TriggerConfig[],
	branch: string,
): CommitTriggerConfig | undefined {
	return triggers.find(
		(t): t is CommitTriggerConfig =>
			t.type === "commit" &&
			t.enabled &&
			(t.branches ?? []).some((p) => matchBranch(p, branch)),
	);
}

export function findTagTrigger(
	triggers: TriggerConfig[],
): TagTriggerConfig | undefined {
	return triggers.find(
		(t): t is TagTriggerConfig => t.type === "tag" && t.enabled,
	);
}

export function findPullRequestTrigger(
	triggers: TriggerConfig[],
	baseBranch: string,
): PullRequestTriggerConfig | undefined {
	return triggers.find((t): t is PullRequestTriggerConfig => {
		if (t.type !== "pull_request" || !t.enabled) {return false;}
		if (!t.branches || t.branches.length === 0) {return true;}
		return t.branches.some((p) => matchBranch(p, baseBranch));
	});
}
