import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@mincy/shared";

async function fetchAgents(): Promise<Tables<"Agents">[]> {
	const res = await fetch("/api/agents");
	if (!res.ok) {
		throw new Error("Failed to fetch agents");
	}
	return res.json();
}

async function createAgent(name: string): Promise<{ agent: Tables<"Agents">; token: string }> {
	const res = await fetch("/api/agents/create", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name }),
	});
	if (!res.ok) {
		const err = await res.json();
		throw new Error(err.message || "Failed to create agent");
	}
	return res.json();
}

async function deleteAgent(id: string): Promise<void> {
	const res = await fetch(`/api/agents/${id}`, { method: "DELETE" });
	if (!res.ok) {
		throw new Error("Failed to delete agent");
	}
}

export function useAgents() {
	return useQuery({
		queryKey: ["agents"],
		queryFn: fetchAgents,
		refetchInterval: 10_000,
	});
}

export function useCreateAgent() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createAgent,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agents"] });
		},
	});
}

export function useDeleteAgent() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteAgent,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agents"] });
		},
	});
}
