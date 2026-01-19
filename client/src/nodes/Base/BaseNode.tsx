import { Badge, Flex, Group, Indicator, Paper, rgba, Text, useMantineTheme } from "@mantine/core";
import classes from "./BaseNode.module.css"
import { Handle, Position } from "@xyflow/react";
import { NodeDefinition, nodeRegistry } from "../registry";
import { ComponentHeader } from "@/src/components/ComponentHeader/ComponentHeader";
import { error } from "console";

export interface NodeExtraProp {
    preview: boolean
}

interface NodeProp {
  valid: boolean;
  details?: React.ReactNode;
  horizontal?: boolean;
  hasInput?: boolean;
  hasOutput?: boolean;
  color?: string;
  preview?: boolean;
  selected: boolean;
  node: NodeDefinition;
  minwidth?: number;
  maxWidth?: number;

}

export function BaseNode({
  valid,
  node,
  details,
  horizontal = true,
  hasInput = true,
  hasOutput = true,
  preview = false,
  selected= false,
  minwidth,
  maxWidth
}: NodeProp) {

  const theme = useMantineTheme()
  return (
    <Paper
      className={classes.node}
      withBorder
      miw={minwidth}
      maw={maxWidth}
      bd={ `1px solid ${!valid ? theme.colors.red[7] : selected ? theme.colors.blue[2] : "var(--mantine-color-default-border)"}` }
      style={(theme)=> ({
        pointerEvents: preview ? "none" : "auto",
      })}
    >
      <ComponentHeader 
        node={node}
        showDescription={false}
        draggable={false}
        RightIcon={valid === false ? (
          <Badge
            variant="dot"
            bd={0}
            p={0}
            color="red"
            style={{ backgroundColor: "transparent" }}
          />
        ) : <></>}

      />

      {!preview && details && (
        <div className={classes.extra_content}>{details}</div>
      )}

      {!preview && hasInput && (
        <Handle
          type="target"
          style={{ background: node.color }}
          position={horizontal ? Position.Left : Position.Bottom}
        />
      )}

      {!preview && hasOutput && (
        <Handle
          type="source"
          style={{ background: node.color }}
          position={horizontal ? Position.Right : Position.Top}
        />
      )}
    </Paper>
  );
}
