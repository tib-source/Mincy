import { Job } from "@mincy/shared/dist/types";
import { useDesignerStore } from "../../store/store";


export function useWorkflowDAG() {
	const { nodes, edges } = useDesignerStore.getState();

	const workflow = nodes.reduce<Record<string, Job>>((acc, node) => {
		acc[node.id] = {
			id: node.id,
			type: node.type,
			config: node.data?.config,
			dependsOn: edges
				.filter((edges) => {
					return edges.target === node.id;
				})
				.map((edge) => edge.source),
			next: edges
				.filter((edges) => {
					return edges.source === node.id;
				})
				.map((edge) => edge.target),
		}
	
		return acc
	}, {})



	console.log(workflow);
}
