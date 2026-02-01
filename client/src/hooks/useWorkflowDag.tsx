import { useDesignerStore } from "../store/store";

interface Node {
	id: string;
	type?: string;
	config: any;
	dependsOn: number;
	next: string[];
}

export interface Workflow {
	id: number;
	project_id: number;
	jobs: Node[];
	environment?: JSON;
}

export function useWorkflowDAG() {
	const { nodes, edges } = useDesignerStore.getState();

	const workflow: Node[] = [];

	nodes.map((node) => {
		const step: Node = {
			id: node.id,
			type: node.type,
			config: node.data?.config,
			dependsOn: 0,
			next: edges
				.filter((edges) => {
					return edges.source === node.id;
				})
				.map((edge) => edge.target),
		};

		workflow.push(step);
	});

	console.log(workflow);
}
