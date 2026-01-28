"use client";

import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	Background,
	BackgroundVariant,
	ColorMode,
	Connection,
	Controls,
	Edge,
	EdgeChange,
	Node,
	NodeChange,
	ReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import "@xyflow/react/dist/style.css";
import {
	ActionIcon,
	Anchor,
	Box,
	Button,
	ButtonGroup,
	Flex,
	Group,
	MantineColorScheme,
	NavLink,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
import {
	IconArrowBackUp,
	IconArrowLeft,
	IconChevronLeft,
	IconDeviceFloppy,
	IconHome2,
	IconPencil,
	IconSquareRoundedCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import { FlowCanvas } from "@/src/components/Canvas/FlowCanvas";
import { ComponentList } from "@/src/components/ComponentList/ComponentList";
import type { HeaderContent } from "@/src/context/HeaderContext";
import { useHeader } from "@/src/hooks/useHeader";
import { useWorkflowDAG } from "@/src/hooks/useWorkflowDag";
import { GitCheckoutNode } from "@/src/nodes/GitCheckoutNode";
import { nodeRegistry } from "@/src/nodes/registry";
import { TriggerNode } from "@/src/nodes/TriggerNode";
import { useDesignerStore, useNavBarState } from "@/src/store/store";

export default function ProjectEditPage() {
	const projectData = {
		name: "Maker",
		link: "/projects/1",
	};

	const projectEditHeader: HeaderContent = {
		left: (
			<Group>
				<ActionIcon
					variant="subtle"
					aria-label="Settings"
					href={projectData.link}
					component={Link}
				>
					<IconChevronLeft stroke={1.5} />
				</ActionIcon>
				<Flex align="center">
					<Text fz="h3">{projectData.name}</Text>
					<ActionIcon variant="transparent" color="gray" aria-label="Settings">
						<IconPencil style={{ width: "70%", height: "70%" }} stroke={1.5} />
					</ActionIcon>
				</Flex>
			</Group>
		),
		right: (
			<Group justify="center">
				<Button leftSection={<IconArrowBackUp size={14} />} variant="default">
					Undo
				</Button>

				<Button
					variant="default"
					leftSection={<IconSquareRoundedCheck size={14} />}
				>
					Validate
				</Button>

				<Button leftSection={<IconDeviceFloppy size={14} />}>
					Save Changes
				</Button>
			</Group>
		),
	};

	useHeader(projectEditHeader);
	const nodes = useDesignerStore((state) => state.nodes);
	const edges = useDesignerStore((state) => state.edges);

	//TODO : have this sent to supabase and it create a pipeline under a user. Agent should then be able to run it
	useEffect(() => useWorkflowDAG(), []);

	const { setDocked } = useNavBarState();

	useEffect(() => {
		setDocked(true);

		return () => setDocked(false);
	}, []);

	return (
		<Flex h="100%">
			<ComponentList />
			<FlowCanvas />
		</Flex>
	);
}
