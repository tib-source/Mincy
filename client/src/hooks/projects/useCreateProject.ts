import { GitHubRepo } from "@/src/client/gitClient";
import { createProject } from "@/src/client/projects";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateProject = () => {
    const queryClient = useQueryClient()
    return useMutation({
		mutationFn: createProject,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
} 
