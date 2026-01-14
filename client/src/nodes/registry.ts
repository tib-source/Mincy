import React, { JSX } from "react";
import { TriggerNode } from "./TriggerNode";
import { GitCheckoutNode } from "./GitCheckoutNode";
import { IconGitCommit, IconPlayerPlay } from "@tabler/icons-react";


export type NodeDefinition = {
  type: string;
  label: string;
  component: React.ComponentType<any>;
  icon: React.ComponentType<any>;
};


export const nodeRegistry: NodeDefinition[] = [
  {
    type: "TriggerNode",
    label: "Trigger",
    icon: IconPlayerPlay,
    component: TriggerNode,
  },
  {
    type: "GitCheckoutNode",
    label: "Git Checkout",
    icon: IconGitCommit,
    component: GitCheckoutNode,
  },
];