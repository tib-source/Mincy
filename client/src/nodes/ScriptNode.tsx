import { IconCommand, IconGitCommit, IconTerminal } from "@tabler/icons-react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./Base/BaseNode";
import type { NodeDefinition } from "./registry";

export const ScriptNodeDefinition: NodeDefinition = {
	type: "ScriptNode",
	label: "Command",
	icon: IconTerminal,
	component: ScriptNode,
	category: "Source",
	color: "",
	description: "Run terminal commands",
};

export function ScriptNode({ selected }: NodeProps) {
	// const onChange = useCallback((evt) => {
	//   console.log(evt.target.value);
	// }, []);

	return (
		<BaseNode node={ScriptNodeDefinition} valid={true} selected={selected} />
	);
}
