import { updateWorkflow } from "@/src/client/workflow";
import { Json } from "@mincy/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export function useUpdateWorkflow(projectId: string, workflow: object){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => updateWorkflow(projectId, workflow),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["workflow", projectId] });
		},
    })
}