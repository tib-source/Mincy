import { Badge, Paper, useMantineTheme } from "@mantine/core";
import { Handle, NodeResizer, Position } from "@xyflow/react";
import { ComponentHeader } from "@/src/components/ComponentHeader/ComponentHeader";
import type { NodeDefinition } from "../registry";
import classes from "./BaseNode.module.css";

export interface NodeExtraProp {
	preview: boolean;
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
	resizable?: boolean;
	node: NodeDefinition;
	minwidth?: number;
	minHeight?: number;
}

export function BaseNode({
	valid,
	node,
	details,
	horizontal = true,
	hasInput = true,
	hasOutput = true,
	preview = false,
	selected = false,
	resizable = false,
	minwidth = 200,
	minHeight = 150,
}: NodeProp) {
	const theme = useMantineTheme();
	return (
		<Paper
			className={classes.node}
			withBorder
			miw={minwidth}
			bd={`1px solid ${!valid ? theme.colors.red[7] : selected ? theme.colors.blue[2] : "var(--mantine-color-default-border)"}`}
			style={() => ({
				pointerEvents: preview ? "none" : "auto",
			})}
		>
			<NodeResizer isVisible={selected && resizable} minWidth={minwidth} minHeight={minHeight} />
			<ComponentHeader
				node={node}
				showDescription
				draggable={false}
				RightIcon={
					valid === false ? (
						<Badge
							variant="dot"
							bd={0}
							p={0}
							color="red"
							style={{ backgroundColor: "transparent" }}
						/>
					) : (
						<></>
					)
				}
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
