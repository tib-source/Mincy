import type { Run, Step, NodeManifest } from "@mincy/shared";
import { logger } from "../logger/pino";

export interface JobContext {
	workflowId: string;
	jobId: string;
	runId: string;
}

export interface MaterializedStep {
	cmd: string[];
	env: string[];
}

const DEFAULT_SHELL_ARGV: readonly string[] = ["bash", "-c"];
const SHELL_ARGV: Record<string, readonly string[]> = {
	bash: DEFAULT_SHELL_ARGV,
	sh: ["sh", "-c"],
	zsh: ["zsh", "-c"],
};

function buildShellCmd(shell: string | undefined, script: string): string[] {
	const prefix = (shell ? SHELL_ARGV[shell] : undefined) ?? DEFAULT_SHELL_ARGV;
	return [...prefix, script];
}

// when testing locally - localhost urls cant be resolved from inside docker
// need to rewrite to host.docker.internal
function containerFacingUrl(url: string): string {
	const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? url : `http://${url}`;

	let parsed: URL;
	try {
		parsed = new URL(withScheme);
	} catch {
		logger.warn(
			`Server URL "${url}" is not a valid URL. Using as-is without rewriting.`,
		);
		return url;
	}

	if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
		parsed.hostname = "host.docker.internal";
		return parsed.toString().replace(/\/$/, "");
	}
	return url;
}

export abstract class BaseExecutor {
	protected readonly server: string;
	protected readonly containerServer: string;
	protected readonly token: string;
	protected readonly nodesDir: string;
	private readonly manifestRegistry: Map<string, NodeManifest>;

	constructor(
		server: string,
		token: string,
		nodesDir: string,
		manifests: NodeManifest[],
	) {
		this.server = server;
		this.containerServer = containerFacingUrl(server);
		this.token = token;
		this.nodesDir = nodesDir;
		this.manifestRegistry = new Map(manifests.map((m) => [m.type, m]));
	}

	abstract execute(run: Run): Promise<number>;

	async materializeStep(step: Step, run: Run): Promise<MaterializedStep | null> {
		const materialized = await this.materializeStepInner(step, run);
		if (!materialized) return null;
		return {
			cmd: materialized.cmd,
			env: [...this.platformEnv(run, step), ...materialized.env],
		};
	}

	private async materializeStepInner(
		step: Step,
		run: Run,
	): Promise<MaterializedStep | null> {
		switch (step.type) {
			case "GitCheckoutNode":
				return this.materializeGitCheckout(step, run);

			case "ScriptNode":
				return this.materializeScript(step);

			default:
				return this.materializeFromManifest(step, run);
		}
	}

	private platformEnv(run: Run, step: Step): string[] {
		return [
			`MINCY_SERVER=${this.containerServer}`,
			`MINCY_TOKEN=${this.token}`,
			`MINCY_RUN_ID=${run.id}`,
			`MINCY_STEP_ID=${step.id}`,
			`MINCY_PROJECT_ID=${run.project_id ?? ""}`,
		];
	}

	private async materializeGitCheckout(
		_step: Step,
		run: Run,
	): Promise<MaterializedStep> {
		const env: string[] = [];

		if (run.project?.cloneUrl) {
			let repoUrl = run.project.cloneUrl;
			const gitToken = run.project_id
				? await this.fetchGitToken(run.project_id)
				: null;
			if (gitToken) {
				repoUrl = repoUrl.replace(
					"https://",
					`https://x-access-token:${gitToken}@`,
				);
			}

			env.push(`REPO_URL=${repoUrl}`);
		}

		if (run.trigger_context) {
			const ctx = run.trigger_context as Record<string, unknown>;
			if (ctx.ref) env.push(`REF=${String(ctx.ref)}`);
			if (ctx.sha) env.push(`COMMIT_SHA=${String(ctx.sha)}`);
			if (ctx.branch) env.push(`BRANCH=${String(ctx.branch)}`);
		}

		return {
			cmd: ["sh", "/mincy/nodes/git-checkout/run.sh"],
			env,
		};
	}

	private materializeScript(step: Step): MaterializedStep | null {
		const config = step.data?.config as
			| { script?: string; shell?: string }
			| undefined;
		const script = config?.script;
		if (!script) return null;
		const wrapped = `set -e\nset -o pipefail\n${script}`;
		return { cmd: buildShellCmd(config?.shell, wrapped), env: [] };
	}

	private materializeFromManifest(
		step: Step,
		_run: Run,
	): MaterializedStep | null {
		const manifest = this.manifestRegistry.get(step.type ?? "");
		if (!manifest) return null;

		const scriptPath = `/mincy/nodes/${step.type}/${manifest.execution.script}`;
		const env: string[] = [];

		const config = (step.data?.config as Record<string, unknown>) ?? {};
		for (const [key, mapping] of Object.entries(manifest.configMapping)) {
			const value = config[key];
			if (value !== undefined) {
				env.push(`${mapping.env}=${String(value)}`);
			}
		}

		return { cmd: ["sh", scriptPath], env };
	}

	async fetchGitToken(projectId: string): Promise<string | null> {
		try {
			const res = await fetch(`${this.server}/api/agents/token`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.token}`,
				},
				body: JSON.stringify({ projectId }),
			});
			if (!res.ok) return null;
			const data = (await res.json()) as { token?: string };
			return data.token ?? null;
		} catch {
			return null;
		}
	}
}
