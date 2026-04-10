import { useMemo } from "react";
import type { NodeDefinition } from "../nodes/registry";

export function useComponentTree(nodes: NodeDefinition[]) {
	return useMemo(() => {
		const categoryMap: Record<string, NodeDefinition[]> = {};
		for (const node of nodes) {
			if (!categoryMap[node.category]) {
				categoryMap[node.category] = [];
			}
			categoryMap[node.category].push(node);
		}

		return {
			categories: Object.keys(categoryMap),
			categoryMap,
		};
	}, [nodes]);
}
