import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@mincy/shared";
import type { GitHubRepo } from "./gitClient";

export async function getProjectById(
	projectId: string,
): Promise<Tables<"Projects">> {
	const supabase = createClient();

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

export async function getProjects(): Promise<Tables<"Projects">[]> {
	const supabase = createClient();

	const { data, error } = await supabase.from("Projects").select("*");

	if (error) {
		throw new Error(error.message);
	}

	return data || [];
}

export async function deleteProject(projectId: string) {
	const supabase = createClient();

	const { error } = await supabase
		.from("Projects")
		.delete()
		.eq("id", projectId);

	if (error) {
		throw new Error(error.message);
	}
}

export async function createProject(repo: GitHubRepo & { installation_id?: number }) {
	const res = await fetch("/api/projects", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			name: repo.name,
			description: repo.description ?? "",
			org: repo.owner.login,
			provider: "github",
			cloneUrl: repo.clone_url,
			installation_id: repo.installation_id,
		}),
	});

	if (!res.ok) {
		const errorData = await res.json();
		const errorMessage =
			errorData.message || errorData.error || "Failed to create project";
		throw new Error(errorMessage);
	}

	return res.json();
}
