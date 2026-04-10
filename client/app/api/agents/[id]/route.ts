import { getSession } from "@/utils/api/getSession";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await getSession();
	if (!session.ok) {
		return NextResponse.json(
			{ message: session.error },
			{ status: 401 },
		);
	}

	const { id } = await params;

	const { error } = await session.supabase
		.from("Agents")
		.delete()
		.eq("id", id);

	if (error) {
		return NextResponse.json(
			{ message: error.message },
			{ status: 500 },
		);
	}

	return NextResponse.json({}, { status: 200 });
}
