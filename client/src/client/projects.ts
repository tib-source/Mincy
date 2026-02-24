import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@mincy/shared";
import { GitHubRepo } from "./gitClient";

export async function getProjectById(
	projectId: string
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


export async function createProject(repo: GitHubRepo) {
	const res = await fetch("/api/projects", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			name: repo.name,
			description: repo.description ?? "",
			org: repo.owner.login,
			provider: "github",
			cloneUrl: repo.git_url,
		}),
	});

	if (!res.ok) {
		const errorData = await res.json();
		const errorMessage = errorData.message || errorData.error || "Failed to create project";
		throw new Error(errorMessage);
	}
	
	return res.json();
}
