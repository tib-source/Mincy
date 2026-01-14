import { Badge, Flex, Group, Indicator, Paper, Text } from "@mantine/core";
import classes from "./BaseNode.module.css"
import { Handle, Position } from "@xyflow/react";

export interface NodeExtraProp {
    preview: boolean
}

interface NodeProp {
  icon: React.ReactNode;
  name: string;
  valid: boolean;
  details?: React.ReactNode;

  horizontal?: boolean;

  inputHandle?: boolean;
  outputHandle?: boolean;

  preview?: boolean;
}

export function BaseNode({
  icon,
  name,
  valid,
  details,
  horizontal = true,
  inputHandle = true,
  outputHandle = true,
  preview = false,
}: NodeProp) {
  return (
    <Paper
      className={classes.node}
      withBorder
      style={{
        pointerEvents: preview ? "none" : "auto",
      }}
    >
      <Group className={classes.node_header} justify="space-between">
        <Flex justify="flex-start">
          {icon}
          <Text>{name}</Text>
        </Flex>
        {valid === false && (
          <Badge
            variant="dot"
            bd={0}
            p={0}
            color="red"
            style={{ backgroundColor: "transparent" }}
          />
        )}
      </Group>

      {!preview && details && (
        <div className={classes.extra_content}>{details}</div>
      )}

      {!preview && inputHandle && (
        <Handle
          type="target"
          position={horizontal ? Position.Left : Position.Bottom}
        />
      )}

      {!preview && outputHandle && (
        <Handle
          type="source"
          position={horizontal ? Position.Right : Position.Top}
        />
      )}
    </Paper>
  );
}
