import { getSession } from "@/utils/api/getSession";
import { createHash, randomBytes } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const session = await getSession();
	if (!session.ok) {
		return NextResponse.json({ message: session.error }, { status: 401 });
	}

	const { name } = await request.json();
	if (!name || typeof name !== "string") {
		return NextResponse.json(
			{ message: "Agent name is required" },
			{ status: 400 },
		);
	}

	const token = randomBytes(32).toString("hex");
	const tokenHash = createHash("sha256").update(token).digest("hex");

	const user = await session.supabase.auth.getUser();

	const { data, error } = await session.supabase
		.from("Agents")
		.insert({
			name,
			token_hash: tokenHash,
			status: "stopped",
			user_id: user.data.user?.id,
		})
		.select()
		.single();

	if (error) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}

	return NextResponse.json({ agent: data, token }, { status: 201 });
}
