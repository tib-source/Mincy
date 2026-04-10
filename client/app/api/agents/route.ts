import { getSession } from "@/utils/api/getSession";
import { NextResponse } from "next/server";

export async function GET() {
	const session = await getSession();
	if (!session.ok) {
		return NextResponse.json(
			{ message: session.error },
			{ status: 401 },
		);
	}

	const { data, error } = await session.supabase
		.from("Agents")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) {
		return NextResponse.json(
			{ message: error.message },
			{ status: 500 },
		);
	}

	return NextResponse.json(data);
}
