import { createClient } from "@/utils/supabase/client";
import { CACHE_BUCKET } from "@/utils/constants";

export async function clearProjectCaches(projectId: string): Promise<number> {
	const supabase = createClient();

	const { data: objects, error: listErr } = await supabase.storage
		.from(CACHE_BUCKET)
		.list(projectId);

	if (listErr) {
		throw new Error(listErr.message);
	}
	if (!objects || objects.length === 0) {
		return 0;
	}

	const paths = objects.map((o) => `${projectId}/${o.name}`);
	const { error: removeErr } = await supabase.storage
		.from(CACHE_BUCKET)
		.remove(paths);

	if (removeErr) {
		throw new Error(removeErr.message);
	}

	return paths.length;
}
