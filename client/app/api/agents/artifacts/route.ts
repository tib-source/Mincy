import { createHash } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { validateAgentToken } from "@/utils/agents/validateAgentToken";
import { createClient } from "@/utils/supabase/server";
import { ARTIFACTS_BUCKET } from "@/utils/constants";

export async function POST(request: NextRequest) {
	const agent = await validateAgentToken(request);
	if (!agent) {
		return NextResponse.json(
			{ message: "Invalid credentials" },
			{ status: 401 },
		);
	}

	const form = await request.formData();
	const runId = form.get("run_id");
	const stepId = form.get("step_id");
	const name = form.get("name");
	const file = form.get("file");

	if (typeof runId !== "string" || typeof name !== "string") {
		return NextResponse.json(
			{ message: "run_id and name are required" },
			{ status: 400 },
		);
	}
	if (!(file instanceof File)) {
		return NextResponse.json(
			{ message: "file is required (multipart upload)" },
			{ status: 400 },
		);
	}

	const supabase = await createClient();

	const { data: run, error: runErr } = await supabase
		.from("PipelineRun")
		.select("id, project_id")
		.eq("id", runId)
		.single();

	if (runErr || !run) {
		return NextResponse.json({ message: "Run not found" }, { status: 404 });
	}
	if (!run.project_id) {
		return NextResponse.json(
			{ message: "Run has no associated project" },
			{ status: 400 },
		);
	}

	const bytes = new Uint8Array(await file.arrayBuffer());
	const sha256 = createHash("sha256").update(bytes).digest("hex");
	const contentType = file.type || "application/octet-stream";
	const storageKey = `${run.project_id}/${run.id}/${crypto.randomUUID()}-${name}`;

	const { error: uploadErr } = await supabase.storage
		.from(ARTIFACTS_BUCKET)
		.upload(storageKey, bytes, { contentType, upsert: false });

	if (uploadErr) {
		console.error("Artifact upload failed:", uploadErr);
		return NextResponse.json(
			{ message: "Upload failed", error: uploadErr.message },
			{ status: 500 },
		);
	}

	const { data: artifact, error: insertErr } = await supabase
		.from("Artifacts")
		.insert({
			run_id: run.id,
			step_id: typeof stepId === "string" && stepId ? stepId : null,
			name,
			storage_key: storageKey,
			size_bytes: bytes.length,
			sha256,
			content_type: contentType,
		})
		.select("id, name, size_bytes, sha256, created_at")
		.single();

	if (insertErr) {
		console.error("Artifact insert failed:", insertErr);
		await supabase.storage.from(ARTIFACTS_BUCKET).remove([storageKey]);
		return NextResponse.json(
			{ message: "Insert failed", error: insertErr.message },
			{ status: 500 },
		);
	}

	return NextResponse.json({ artifact }, { status: 201 });
}

export const runtime = "nodejs";
