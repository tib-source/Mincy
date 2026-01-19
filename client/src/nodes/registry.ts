import React, { JSX } from "react";
import { TriggerNode, TriggerNodeDefinition } from "./TriggerNode";
import { GitCheckoutNode, GitCheckoutNodeDefinition } from "./GitCheckoutNode";
import { IconGitCommit, IconPlayerPlay } from "@tabler/icons-react";
import { MantineColor } from "@mantine/core";


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
  GitCheckoutNodeDefinition
];