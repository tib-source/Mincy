import { describe, expect, test } from "bun:test";
import type { NodeManifest, Run, Step } from "@mincy/shared";
import { BaseExecutor } from "../src/executors/executor";

class TestExecutor extends BaseExecutor {
	public gitToken: string | null = null;
	public fetchGitTokenCalls: string[] = [];

	async execute(): Promise<number> {
		return 0;
	}

	override async fetchGitToken(projectId: string): Promise<string | null> {
		this.fetchGitTokenCalls.push(projectId);
		return this.gitToken;
	}

	get containerServerPublic(): string {
		return this.containerServer;
	}
}

function makeRun(overrides: Partial<Record<string, unknown>> = {}): Run {
	return {
		id: "run-1",
		project_id: "proj-1",
		trigger_context: null,
		project: { cloneUrl: "https://github.com/me/repo.git" },
		workflow: { id: "wf-1", projectId: "proj-1", jobs: {} },
		...overrides,
	} as unknown as Run;
}

function makeStep(overrides: Partial<Step> = {}): Step {
	return {
		id: "step-1",
		type: "ScriptNode",
		data: {},
		status: "queued",
		dependsOn: [],
		next: [],
		...overrides,
	};
}

function makeExecutor(
	server = "http://localhost:3000",
	manifests: NodeManifest[] = [],
): TestExecutor {
	return new TestExecutor(server, "test-token", "/nodes", manifests);
}

describe("Environment Variables in Agent", () => {
	test("all MINCY environment variables are injected", async () => {
		const ex = makeExecutor("http://localhost:3000");
		const step = makeStep({
			id: "step-X",
			type: "ScriptNode",
			data: { config: { script: "echo hi" } },
		});
		const run = makeRun({ id: "run-X", project_id: "proj-X" });

		const result = await ex.materializeStep(step, run);
		expect(result).not.toBeNull();
		expect(result?.env).toEqual(
			expect.arrayContaining([
				"MINCY_SERVER=http://host.docker.internal:3000",
				"MINCY_TOKEN=test-token",
				"MINCY_RUN_ID=run-X",
				"MINCY_STEP_ID=step-X",
				"MINCY_PROJECT_ID=proj-X",
			]),
		);
	});
});

describe("Scripts materialized", () => {
	test("wraps script with set -e and set -o pipefail using bash by default", async () => {
		const ex = makeExecutor();
		const step = makeStep({
			type: "ScriptNode",
			data: { config: { script: "echo hello" } },
		});

		const result = await ex.materializeStep(step, makeRun());
		expect(result?.cmd).toEqual([
			"bash",
			"-c",
			"set -e\nset -o pipefail\necho hello",
		]);
	});

	test("Allows custom shell from UI", async () => {
		const ex = makeExecutor();
		const step = makeStep({
			type: "ScriptNode",
			data: { config: { script: "echo hello", shell: "sh" } },
		});

		const result = await ex.materializeStep(step, makeRun());
		expect(result?.cmd.slice(0, 2)).toEqual(["sh", "-c"]);
	});


	test("Uses bash when unknown shell provided", async () => {
		const ex = makeExecutor();
		const step = makeStep({
			type: "ScriptNode",
			data: { config: { script: "echo hi", shell: "fish" } },
		});

		const result = await ex.materializeStep(step, makeRun());
		expect(result?.cmd).toEqual([
			"bash",
			"-c",
			"set -e\nset -o pipefail\necho hi",
		]);
	});

	test("returns null when script is missing", async () => {
		const ex = makeExecutor();
		const step = makeStep({ type: "ScriptNode", data: { config: {} } });

		const result = await ex.materializeStep(step, makeRun());
		expect(result).toBeNull();
	});

	test("returns null when step has no config", async () => {
		const ex = makeExecutor();
		const step = makeStep({ type: "ScriptNode", data: {} });

		const result = await ex.materializeStep(step, makeRun());
		expect(result).toBeNull();
	});
});

describe("Git Checkout materialized", () => {
	test("injects github token when its available", async () => {
		const ex = makeExecutor();
		ex.gitToken = "ghs_secret";
		const step = makeStep({ type: "GitCheckoutNode" });
		const run = makeRun({
			project_id: "proj-1",
			project: { cloneUrl: "https://github.com/me/repo.git" },
		});

		const result = await ex.materializeStep(step, run);
		expect(result?.cmd).toEqual(["sh", "/mincy/nodes/git-checkout/run.sh"]);
		expect(result?.env).toContain(
			"REPO_URL=https://x-access-token:ghs_secret@github.com/me/repo.git",
		);
		expect(ex.fetchGitTokenCalls).toEqual(["proj-1"]);
	});

	test("leaves clone URL unchanged when no token returned", async () => {
		const ex = makeExecutor();
		ex.gitToken = null;
		const step = makeStep({ type: "GitCheckoutNode" });
		const run = makeRun({
			project_id: "proj-1",
			project: { cloneUrl: "https://github.com/me/repo.git" },
		});

		const result = await ex.materializeStep(step, run);
		expect(result?.env).toContain(
			"REPO_URL=https://github.com/me/repo.git",
		);
	});

	test("injects git context as env vars", async () => {
		const ex = makeExecutor();
		const step = makeStep({ type: "GitCheckoutNode" });
		const run = makeRun({
			trigger_context: {
				ref: "refs/heads/main",
				sha: "abc123",
				branch: "main",
			},
		});

		const result = await ex.materializeStep(step, run);
		expect(result?.env).toEqual(
			expect.arrayContaining([
				"REF=refs/heads/main",
				"COMMIT_SHA=abc123",
				"BRANCH=main",
			]),
		);
	});
});

describe("Marketplace nodes materialized", () => {
	const manifest: NodeManifest = {
		type: "CacheSaveNode",
		label: "Cache Save",
		category: "cache",
		color: "#fff",
		description: "",
		icon: "",
		execution: { script: "run.sh" },
		inputs: {},
		configMapping: {
			key: { env: "CACHE_KEY" },
			path: { env: "CACHE_PATH" },
		},
	};

	test("maps configured values into env using manifest's config", async () => {
		const ex = makeExecutor("http://localhost:3000", [manifest]);
		const step = makeStep({
			type: "CacheSaveNode",
			data: { config: { key: "node-modules", path: "./node_modules" } },
		});

		const result = await ex.materializeStep(step, makeRun());
		expect(result?.cmd).toEqual(["sh", "/mincy/nodes/CacheSaveNode/run.sh"]);
		expect(result?.env).toEqual(
			expect.arrayContaining([
				"CACHE_KEY=node-modules",
				"CACHE_PATH=./node_modules",
			]),
		);
	});

	test("skips env vars whose config value is undefined", async () => {
		const ex = makeExecutor("http://localhost:3000", [manifest]);
		const step = makeStep({
			type: "CacheSaveNode",
			data: { config: { key: "only-key" } },
		});

		const result = await ex.materializeStep(step, makeRun());
		expect(result?.env).toContain("CACHE_KEY=only-key");
		expect(result?.env.some((e) => e.startsWith("CACHE_PATH="))).toBe(false);
	});

	test("coerces non-string config values to strings", async () => {
		const withNumber: NodeManifest = {
			...manifest,
			configMapping: { count: { env: "COUNT" } },
		};
		const ex = makeExecutor("http://localhost:3000", [withNumber]);
		const step = makeStep({
			type: "CacheSaveNode",
			data: { config: { count: 42 } },
		});

		const result = await ex.materializeStep(step, makeRun());
		expect(result?.env).toContain("COUNT=42");
	});

	test("returns null for unknown step types", async () => {
		const ex = makeExecutor("http://localhost:3000", [manifest]);
		const step = makeStep({ type: "UnregisteredNode", data: { config: {} } });

		const result = await ex.materializeStep(step, makeRun());
		expect(result).toBeNull();
	});

	test("handles step with no data.config", async () => {
		const ex = makeExecutor("http://localhost:3000", [manifest]);
		const step = makeStep({ type: "CacheSaveNode", data: {} });

		const result = await ex.materializeStep(step, makeRun());
		expect(result?.cmd).toEqual(["sh", "/mincy/nodes/CacheSaveNode/run.sh"]);
		expect(result?.env.filter((e) => !e.startsWith("MINCY_"))).toEqual([]);
	});
});
