import type { JobStatus } from "@mincy/shared";
import { after, type NextRequest, NextResponse } from "next/server";
import { type RunWithProject, updateRunStatus } from "@/actions/runs";
import {
	buildCheckOutput,
	runDetailsUrl,
} from "@/app/api/webhooks/github/lib/checkOutput";
import type { ContextType, TriggerType } from "@/src/dto/runs";
import { validateAgentToken } from "@/utils/agents/validateAgentToken";
import {
	checkStateForJobStatus,
	updateCheckRun,
} from "@/utils/api/githubChecks";
import { createClient } from "@/utils/supabase/server";

const VALID_STATUSES = new Set<JobStatus>([
	"running",
	"passed",
	"failed",
	"completed",
]);

const TERMINAL_STATUSES = new Set<JobStatus>(["passed", "failed", "completed"]);

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const agent = await validateAgentToken(request);
	if (!agent) {
		return NextResponse.json(
			{ message: "Invalid credentials" },
			{ status: 401 },
		);
	}

	const { id } = await params;
	if (!id) {
		return NextResponse.json(
			{ message: "Job ID is required" },
			{ status: 400 },
		);
	}

	const { status } = await request.json();
	if (!status || !VALID_STATUSES.has(status)) {
		return NextResponse.json(
			{ message: "Invalid request body" },
			{ status: 400 },
		);
	}

	const supabase = await createClient();

	let run: RunWithProject | null;
	try {
		run = await updateRunStatus(supabase, id, status, {
			isTerminal: TERMINAL_STATUSES.has(status),
		});
	} catch (error) {
		return NextResponse.json(
			{
				message: "Failed to update job status",
				error: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}

	if (run) {
		after(() => syncCheckRun(run, status));
	}

	return new Response(null, { status: 200 });
}

async function syncCheckRun(run: RunWithProject, status: JobStatus) {
	const project = run.Projects;
	const context = (run.trigger_context ?? {}) as ContextType;
	if (!project?.installation_id || !context.check_run_id) {
		return;
	}

	const checkState = checkStateForJobStatus(status);
	const trigger: TriggerType = run.triggered_by ?? "manual";

	try {
		await updateCheckRun({
			installationId: project.installation_id,
			owner: project.org,
			repo: project.name,
			checkRunId: context.check_run_id,
			status: checkState.status,
			conclusion: checkState.conclusion,
			detailsUrl: runDetailsUrl(project.id, run.id),
			output: buildCheckOutput({
				project,
				runId: run.id,
				trigger,
				context,
				status: checkState.status,
				conclusion: checkState.conclusion,
			}),
		});
	} catch (err) {
		console.error("Failed to update GitHub check run:", err);
	}
}
