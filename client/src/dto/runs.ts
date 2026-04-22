import z from "zod";

export const runContextSchema = z.object({
	ref: z.string().min(1),
	sha: z.string().min(1),
	branch: z.string().optional(),
	pr_number: z.number().optional(),
	tag: z.string().optional(),
	message: z.string().optional(),
	sender: z.string().optional(),
	url: z.string().optional(),
	check_run_id: z.number().optional(),
});

export const triggerTypes = z.union([
	z.literal("manual"),
	z.literal("cron"),
	z.literal("commit"),
	z.literal("pull_request"),
	z.literal("tag"),
]);

export const runWorkflowSchema = z.object({
	projectId: z.string().min(1),
	workflowId: z.string().min(1),
	triggerContext: runContextSchema.optional(),
	triggerType: triggerTypes,
});

export type TriggerType = z.infer<typeof triggerTypes>;
export type ContextType = z.infer<typeof runContextSchema>;
