import { z } from "zod";

export const createProjectSchema = z.object({
	name: z.string().min(1),
	description: z.string().min(0),
	org: z.string().min(1),
	provider: z.union([z.literal("github"), z.literal("bitbucket")]),
	cloneUrl: z.string().min(1),
});
