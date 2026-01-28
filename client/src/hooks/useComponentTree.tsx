import { useMemo } from "react";
import type { NodeDefinition } from "../nodes/registry";

export function useComponentTree(nodes: NodeDefinition[]) {
	return useMemo(() => {
		const categoryMap: Record<string, NodeDefinition[]> = {};
		for (const node of nodes) {
			// ??= will only asign the value if hte left side is null / undefined
			// pretty neat trick haha
			(categoryMap[node.category] ??= []).push(node);
		}

		return {
			categories: Object.keys(categoryMap),
			categoryMap,
		};
	}, [nodes]);
}
