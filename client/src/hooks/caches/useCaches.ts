import { useMutation } from "@tanstack/react-query";
import { clearProjectCaches } from "@/src/client/caches";

export function useClearProjectCaches() {
	return useMutation({
		mutationFn: (projectId: string) => clearProjectCaches(projectId),
	});
}
