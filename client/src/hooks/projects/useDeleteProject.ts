import { deleteProject } from "@/src/client/projects";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteProject = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteProject,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
};
