import { MantineColor } from "@mantine/core";
import { IconGitCommit, IconPlayerPlay } from "@tabler/icons-react";
import type React from "react";
import { JSX } from "react";
import { GitCheckoutNode, GitCheckoutNodeDefinition } from "./GitCheckoutNode";
import { TriggerNode, TriggerNodeDefinition } from "./TriggerNode";

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
];
