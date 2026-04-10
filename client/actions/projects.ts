import { createClient } from "@/utils/supabase/server";
import type { Tables } from "@mincy/shared";

export async function getProjectById(
	projectId: string,
): Promise<Tables<"Projects">> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("Projects")
		.select("*")
		.eq("id", projectId)
		.single();

	if (error) {
		throw new Error(error.message);
	}

	if (!data) {
		throw new Error("Project not found");
	}

	return data;
}
