import type React from "react";
import { TriggerNodeDefinition } from "./TriggerNode";
import { ScriptNodeDefinition } from "./ScriptNode";
import { StageNodeDefinition } from "./Stage/StageNode";
import { marketplaceNodeDefinitions } from "./MarketplaceNode";

export type NodeDefinition = {
	type: string;
	label: string;
	component: React.ComponentType<any>;
	icon: React.ComponentType<any>;
	category: string;
	color: string;
	description: string;
};

const builtInNodes: NodeDefinition[] = [
	TriggerNodeDefinition,
	ScriptNodeDefinition,
	StageNodeDefinition,
];

export const nodeRegistry: NodeDefinition[] = [
	...builtInNodes,
	...marketplaceNodeDefinitions,
];
