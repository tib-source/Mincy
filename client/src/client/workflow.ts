import { createClient } from "@/utils/supabase/client";
import type { Tables, TriggerType } from "@mincy/shared";

import { z } from "zod";

export const PipelineSchema = z.object({
	nodes: z.array(z.any()).default([]),
	edges: z.array(z.any()).default([]),
});

export type WorkflowPipeline = z.infer<typeof PipelineSchema>;

export async function getWorkflowForProject(
	projectId: string,
): Promise<Tables<"Workflow"> | undefined> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("Workflow")
		.select("*")
		.eq("projectId", projectId)
		.maybeSingle();

	if (error) {
		throw new Error(error.message);
	}

	return data || undefined;
}

export async function updateWorkflow(projectId: string, workflow: object) {
	const supabase = createClient();
	const existing = await getWorkflowForProject(projectId);

	if (!existing) {
		throw new Error("Workflow not found for this project");
	}

	const { error } = await supabase
		.from("Workflow")
		.update({
			pipeline: workflow,
		})
		.eq("projectId", projectId);

	if (error) {
		throw new Error(error.message);
	}
}

export type EnvironmentVariable = {
	key: string;
	value: string;
	secret: boolean;
};

export async function updateWorkflowEnvironment(
	projectId: string,
	environment: EnvironmentVariable[],
) {
	const supabase = createClient();
	const existing = await getWorkflowForProject(projectId);

	if (!existing) {
		throw new Error("Workflow not found for this project");
	}

	const { error } = await supabase
		.from("Workflow")
		.update({
			environment: environment as unknown as Tables<"Workflow">["environment"],
		})
		.eq("projectId", projectId);

	if (error) {
		throw new Error(error.message);
	}
}

export async function runWorkflow(
	projectId: string,
	workflowId: string,
	triggerType: TriggerType,
) {
	const res = await fetch("/api/runs", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			projectId,
			workflowId,
			triggerType,
		}),
	});

	if (!res.ok) {
		const errorData = await res.json();
		const errorMessage =
			errorData.message || errorData.error || "Failed to create pipeline run";
		throw new Error(errorMessage);
	}

	return res.json();
}
