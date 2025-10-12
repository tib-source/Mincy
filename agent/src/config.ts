import * as z from "zod";

export const AgentConfig = z.object({
    name: z.string(),
    token: z.string(),
    work_dir: z.string(),
    poll_interval: z.number().default(1000),
    capacity: z.number().default(5)
})