import { getWorkflowForProject } from "@/src/client/workflow"
import { useQuery } from "@tanstack/react-query"

export const useWorkflow = (projectId: string) => { 
    return  useQuery({
        queryKey: ["workflow", projectId],
        queryFn: () => getWorkflowForProject(projectId),
        enabled: !!projectId,
    });
}

