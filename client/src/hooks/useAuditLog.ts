import { getAuditLog } from "@/src/client/audit";
import { useQuery } from "@tanstack/react-query";

export function useAuditLog(page: number) {
	return useQuery({
		queryKey: ["audit_log", page],
		queryFn: () => getAuditLog(page),
	});
}
