import type React from "react";
import { GitCheckoutNodeDefinition } from "./GitCheckoutNode";
import { TriggerNodeDefinition } from "./TriggerNode";
import { ScriptNodeDefinition } from "./ScriptNode";

export type NodeDefinition = {
	type: string;
	label: string;
	component: React.ComponentType<any>;
	icon: React.ComponentType<any>;
	category: string;
	color: string;
	description: string;
};

export const nodeRegistry: NodeDefinition[] = [
	TriggerNodeDefinition,
	GitCheckoutNodeDefinition,
	ScriptNodeDefinition,
];
