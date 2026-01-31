import type { z } from "zod";

export async function parseBody<T extends z.ZodTypeAny>(
	req: Request,
	schema: T,
) {
	const body = await req.json();
	return schema.parse(body);
}
