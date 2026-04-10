import { z } from "zod";

export const createWorkflowSchema = z.object({
	projectId: z.string().min(1),
	environments: z.string().min(0),
	pipeline: z.json()
});

export const runWorkflowSchema = z.object({
	projectId: z.string().min(1),
	workflowId: z.string().min(1)
})