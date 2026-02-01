import { Box, Button, Divider, ScrollArea, Stack, Text } from "@mantine/core";
import {
	IconChevronDown,
	IconChevronRight,
	IconGripVertical,
} from "@tabler/icons-react";
import navClass from "@/src/components/Navbar/Navbar.module.css";
import { useComponentTree } from "@/src/hooks/useComponentTree";
import { nodeRegistry } from "@/src/nodes/registry";
import { useNavBarState } from "@/src/store/store";
import { Collapsable } from "../Collapsable/Collapsable";
import { ComponentHeader } from "../ComponentHeader/ComponentHeader";
import { Search } from "../SearchInput/Search";
import classes from "./ComponentList.module.css";
export function ComponentList() {
	const { categories, categoryMap } = useComponentTree(nodeRegistry);
	const { navbarWidth } = useNavBarState();
	return (
		<ScrollArea
			w={navbarWidth}
			className={navClass.nav}
			style={{
				borderRight: "1px solid var(--mantine-color-default-border)",
				overflowY: "auto",
			}}
		>
			<Box w="100%" p="md">
				<Text c="dimmed" mb="sm">
					Compoent Library
				</Text>
				<Search />
			</Box>
			<Divider />
			<Stack p="md" gap="sm">
				{categories.map((category, index) => (
					<Collapsable
						key={category}
						defaultOpen={true}
						iconOpen={<IconChevronDown width={15} />}
						iconClose={<IconChevronRight width={15} />}
						trigger={
							<Button px={2} py={1.5} fz="md" c="dimmed" variant="transparent">
								{" "}
								{category}{" "}
							</Button>
						}
					>
						<Stack key={category} gap={10}>
							{categoryMap[category].map((node, index) => (
								<ComponentHeader
									node={node}
									key={node.label}
									showDescription={true}
									draggable={true}
									RightIcon={
										<IconGripVertical
											width={15}
											className={classes.grip}
											style={{
												transition: "opacity 0.2s ease",
											}}
										/>
									}
								/>
							))}
						</Stack>
					</Collapsable>
				))}
			</Stack>
		</ScrollArea>
	);
}
