import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { githubApp as app } from "@/utils/api/githubApp";
import { handleCheckRunRerequest } from "./handlers/checkRun";
import { handleCheckSuite } from "./handlers/checkSuite";
import { handlePush } from "./handlers/push";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_PRIVATE_KEY!,
);

app.webhooks.on("push", ({ payload }) => handlePush(supabase, payload));

app.webhooks.on(
	["check_suite.requested", "check_suite.rerequested"],
	({ payload }) => handleCheckSuite(supabase, payload),
);

app.webhooks.on("check_run.rerequested", ({ payload }) =>
	handleCheckRunRerequest(supabase, payload),
);

// inspired by the octokit docs: https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
export async function POST(request: NextRequest) {
	const signature = request.headers.get("x-hub-signature-256");
	const id = request.headers.get("x-github-delivery");
	const event = request.headers.get("x-github-event");

	if (!signature || !id || !event) {
		return NextResponse.json(
			{ message: "Missing required headers" },
			{ status: 400 },
		);
	}

	const payload = await request.text();

	try {
		await app.webhooks.verifyAndReceive({
			id,
			name: event,
			payload,
			signature,
		});
	} catch (error) {
		console.error("Error verifying webhook:", error);
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	return NextResponse.json({ message: "Webhook received" }, { status: 200 });
}

export const runtime = "nodejs";
