import { runWorkflow } from "@/src/client/workflow";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRunWorkflow(projectId: string, workflowId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => runWorkflow(projectId, workflowId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["pipeline-run", projectId],
			});
		},
	});
}
