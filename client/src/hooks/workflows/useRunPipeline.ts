import { runWorkflow } from "@/src/client/workflow";
import type { TriggerType } from "@mincy/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRunWorkflow(projectId: string, workflowId: string, triggerType: TriggerType) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => runWorkflow(projectId, workflowId, triggerType),
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["runs", projectId],
			});
		},
	});
}
