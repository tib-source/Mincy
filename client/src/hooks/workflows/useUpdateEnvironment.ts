import {
	type EnvironmentVariable,
	updateWorkflowEnvironment,
} from "@/src/client/workflow";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateEnvironment(projectId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (environment: EnvironmentVariable[]) =>
			updateWorkflowEnvironment(projectId, environment),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["workflow", projectId],
			});
		},
	});
}
