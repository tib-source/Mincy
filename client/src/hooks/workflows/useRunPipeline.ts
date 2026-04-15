import { runWorkflow } from "@/src/client/workflow";
import { TriggerType } from "@mincy/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRunWorkflow(projectId: string, workflowId: string, triggerType: TriggerType, triggerContext: Record<string, any> = {}) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => runWorkflow(projectId, workflowId, triggerType, triggerContext),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["pipeline-run", projectId],
			});
		},
	});
}
