import { z } from "zod";

export const createWorkflowSchema = z.object({
	projectId: z.string().min(1),
	environments: z.string().min(0),
	pipeline: z.json()
});