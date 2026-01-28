import { Box, Center, Flex, Group, rgba, Text } from "@mantine/core";
import type { NodeDefinition } from "@/src/nodes/registry";
import classes from "./../ComponentList/ComponentList.module.css";

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
	return (
		<Flex
			draggable={draggable}
			// onDragStart={(e) => onDragStart(e, node.type)}
			className={classes.item}
			style={{
				backgroundColor: rgba(node.color, 0.1),
			}}
		>
			<Group gap="sm" flex={1}>
				<Center style={{ backgroundColor: node.color }} bdrs="md" p="xs" h="35">
					<node.icon width={20} />
				</Center>

				<Box className={classes.content}>
					<Text size="sm" fw={500}>
						{node.label}
					</Text>
					{showDescription && (
						<Text size="xs" c="dimmed" className={classes.description}>
							{node.description}
						</Text>
					)}
				</Box>
			</Group>
			{RightIcon}
		</Flex>
	);
}
