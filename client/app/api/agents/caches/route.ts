import { type NextRequest, NextResponse } from "next/server";
import { validateAgentToken } from "@/utils/agents/validateAgentToken";
import { readUpload } from "@/utils/agents/upload";
import { createClient } from "@/utils/supabase/server";
import { CACHE_BUCKET } from "@/utils/constants";

const SIGNED_URL_TTL_SECONDS = 300;

function cacheKeyPath(projectId: string, key: string): string {
	return `${projectId}/${key}.tar.gz`;
}

export async function POST(request: NextRequest) {
	const agent = await validateAgentToken(request);
	if (!agent) {
		return NextResponse.json(
			{ message: "Invalid credentials" },
			{ status: 401 },
		);
	}

	const form = await request.formData();
	const projectId = form.get("project_id");
	const key = form.get("key");
	const file = form.get("file");

	if (typeof projectId !== "string" || typeof key !== "string") {
		return NextResponse.json(
			{ message: "project_id and key are required" },
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
	const { bytes, contentType } = await readUpload(file);
	const storageKey = cacheKeyPath(projectId, key);

	// upsert: true — replacing the same key is the expected cache behavior.
	const { error: uploadErr } = await supabase.storage
		.from(CACHE_BUCKET)
		.upload(storageKey, bytes, { contentType, upsert: true });

	if (uploadErr) {
		console.error("Cache upload failed:", uploadErr);
		return NextResponse.json(
			{ message: "Upload failed", error: uploadErr.message },
			{ status: 500 },
		);
	}

	return NextResponse.json(
		{ key, size_bytes: bytes.length },
		{ status: 201 },
	);
}

export async function GET(request: NextRequest) {
	const agent = await validateAgentToken(request);
	if (!agent) {
		return NextResponse.json(
			{ message: "Invalid credentials" },
			{ status: 401 },
		);
	}

	const url = new URL(request.url);
	const projectId = url.searchParams.get("project_id");
	const key = url.searchParams.get("key");

	if (!projectId || !key) {
		return NextResponse.json(
			{ message: "project_id and key are required" },
			{ status: 400 },
		);
	}

	const supabase = await createClient();
	const storageKey = cacheKeyPath(projectId, key);

	const { data, error } = await supabase.storage
		.from(CACHE_BUCKET)
		.createSignedUrl(storageKey, SIGNED_URL_TTL_SECONDS);

	if (error || !data) {
		return NextResponse.json({ message: "Cache not found" }, { status: 404 });
	}

	return NextResponse.json({ url: data.signedUrl }, { status: 200 });
}


export const runtime = "nodejs";