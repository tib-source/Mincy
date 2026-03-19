import { IconTerminal } from "@tabler/icons-react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./Base/BaseNode";
import type { NodeDefinition } from "./registry";
import { useDesignerStore } from "../store/store";
import { Stack, TextInput, Textarea } from "@mantine/core";

export const ScriptNodeDefinition: NodeDefinition = {
  type: "ScriptNode",
  label: "Command",
  icon: IconTerminal,
  component: ScriptNode,
	category: "Action",
	color: "",
  description: "Run terminal commands",
};

export interface ScriptNodeConfig {
  image: string;
  cmd: string[];
  workdir?: string;
}

export function ScriptNode({ id, selected, data }: NodeProps) {
  const { updateNodeData } = useDesignerStore();
  const config = (data?.config as ScriptNodeConfig) ?? {
    image: "node:20-slim",
    cmd: ["sh", "-c", ""],
  };

  const updateConfig = (updates: Partial<ScriptNodeConfig>) => {
    updateNodeData(id, { config: { ...config, ...updates } });
  };

  const details = (
    <Stack gap="sm">
      <TextInput
        label="Image"
        placeholder="node:20-slim"
        value={config.image}
        onChange={(e) => updateConfig({ image: e.target.value })}
      />
      <Textarea
        label="Command"
        placeholder="npm run build"
        value={config.cmd[2]}  // the actual script part of ["sh", "-c", "..."]
        onChange={(e) => updateConfig({ cmd: ["sh", "-c", e.target.value] })}
      />
    </Stack>
  );

  return (
    <BaseNode
      node={ScriptNodeDefinition}
      valid={!!config.image && !!config.cmd[2]}
      details={details}
      selected={selected}
      minwidth={500}
      maxWidth={500}
    />
  );
}