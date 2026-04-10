import type { NextRequest } from "next/server";
import { createClient } from "../supabase/server";
import { createHash } from "node:crypto";
export async function validateAgentToken(request: NextRequest) {
	const authHeader = request.headers.get("authorization");
	if (authHeader?.startsWith("Bearer ")) {
		const token = authHeader.split(" ")[1];
		const supabase = await createClient();

		const hashed = createHash("sha256").update(token).digest("hex");

		const found = await supabase
			.from("Agents")
			.select()
			.eq("token_hash", hashed)
			.single();
		if (found.data) {
			return found.data;
		}
	}
	return null;
}
