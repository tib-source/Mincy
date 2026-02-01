import { Box, Center, Flex, Group, rgba, Text } from "@mantine/core";
import type { NodeDefinition } from "@/src/nodes/registry";
import classes from "./../ComponentList/ComponentList.module.css";
import { useDnD } from "@/src/context/DnDContext";
import { DragEvent } from "react";

interface ComponentHeaderProps {
	node: NodeDefinition;
	showDescription: boolean;
	RightIcon: React.ReactElement;
	draggable: boolean;
}

export function ComponentHeader({
	node,
	showDescription,
	RightIcon,
	draggable,
}: ComponentHeaderProps) {
	const { setType } = useDnD();

	const onDragStart = (event: DragEvent, nodeType: string) => {
		setType(nodeType);
		event.dataTransfer.effectAllowed = "move";
	};
	return (
		<Flex
			draggable={draggable}
			onDragStart={(event: DragEvent) => onDragStart(event, node.type)}
			className={classes.item}
			style={{
				backgroundColor: rgba(node.color, 0.1),
				overflow: "hidden",
				width: "100%",
			}}
		>
			<Group gap="sm" flex={1} style={{ minWidth: 0 }}>
				<Center style={{ backgroundColor: node.color }} bdrs="md" p="xs" h="35">
					<node.icon width={20} />
				</Center>

				<Box className={classes.content} style={{ minWidth: 0, flex: 1 }}>
					<Text size="sm" fw={500}>
						{node.label}
					</Text>
					{showDescription && (
						<Text
							size="xs"
							c="dimmed"
							truncate="end"
							style={{ display: "block" }}
						>
							{node.description}
						</Text>
					)}
				</Box>
			</Group>
			{RightIcon}
		</Flex>
	);
}
