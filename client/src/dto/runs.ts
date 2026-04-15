import z from "zod";

export const runWorkflowSchema = z.object({
	projectId: z.string().min(1),
	workflowId: z.string().min(1),
});

export const runContextSchema = z.object({
    ref: z.string().min(1),
    sha: z.string().min(1),
    branch: z.string().optional(),
    pr_number: z.number().optional(),
    sender: z.string().min(1),
});

export const triggerTypes = z.union([
    z.literal("manual"),
    z.literal("cron"),
    z.literal("commit"),
    z.literal("pull_request"),
    z.literal("tag"),
]);

export type TriggerType = z.infer<typeof triggerTypes>;