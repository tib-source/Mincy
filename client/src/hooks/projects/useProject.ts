import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProjectStore } from "../../store/store";
import { getProjectById, getProjects } from "../../client/projects";
import { useParams } from "next/navigation";

export function useProject(projectId?: string) {
	if (!projectId){
		projectId = useParams<{projectId: string}>().projectId
	}
	const { setCurrentProject, setIsLoading, setError } = useProjectStore();

	const query = useQuery({
		queryKey: ["project", projectId],
		queryFn: () => getProjectById(projectId),
		enabled: !!projectId,
	});

	useEffect(() => {
		setIsLoading(query.isPending);
	}, [query.isPending, setIsLoading]);

	useEffect(() => {
		if (query.data) {
			setCurrentProject(query.data);
		}
	}, [query.data, setCurrentProject]);

	useEffect(() => {
		if (query.error) {
			setError(
				query.error instanceof Error
					? query.error.message
					: "Failed to load project"
			);
		}
	}, [query.error, setError]);

	return query;
}

export function useAllProjects() {
	return useQuery({
		queryKey: ["projects"],
		queryFn: getProjects,
	});
}
