import { createClient } from "@/utils/supabase/client";
import { ARTIFACTS_BUCKET } from "@/utils/constants";

export interface Artifact {
	id: string;
	run_id: string;
	step_id: string | null;
	name: string;
	storage_key: string;
	size_bytes: number;
	sha256: string | null;
	content_type: string | null;
	created_at: string;
}

const SIGNED_URL_TTL_SECONDS = 60;

export async function getArtifactsForRun(runId: string): Promise<Artifact[]> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("Artifacts" as any)
		.select("*")
		.eq("run_id", runId)
		.order("created_at", { ascending: true });

	if (error) {
		throw new Error(error.message);
	}
	return (data ?? []) as unknown as Artifact[];
}

export async function getArtifactDownloadUrl(
	storageKey: string,
): Promise<string> {
	const supabase = createClient();
	const { data, error } = await supabase.storage
		.from(ARTIFACTS_BUCKET)
		.createSignedUrl(storageKey, SIGNED_URL_TTL_SECONDS);

	if (error || !data) {
		throw new Error(error?.message ?? "Failed to sign URL");
	}
	return data.signedUrl;
}
