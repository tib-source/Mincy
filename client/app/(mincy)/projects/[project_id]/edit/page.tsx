"use client";

import { useEffect } from "react";
import "@xyflow/react/dist/style.css";
import { ActionIcon, Button, Flex, Group, Text } from "@mantine/core";
import {
	IconArrowBackUp,
	IconChevronLeft,
	IconDeviceFloppy,
	IconPencil,
	IconSquareRoundedCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import { FlowCanvas } from "@/src/components/Canvas/FlowCanvas";
import { ComponentList } from "@/src/components/ComponentList/ComponentList";
import type { HeaderContent } from "@/src/context/HeaderContext";
import { useHeader } from "@/src/hooks/useHeader";
import { useWorkflowDAG } from "@/src/hooks/workflows/useWorkflowDag";
import { useDesignerStore, useNavBarState } from "@/src/store/store";
import { DnDProvider } from "@/src/context/DnDContext";
import { ReactFlowProvider } from "@xyflow/react";
import { useProject } from "@/src/hooks/projects/useProject";
import { useParams } from "next/navigation";
import { useUpdateWorkflow } from "@/src/hooks/workflows/useUpdateWorkflow";

export default function ProjectEditPage() {
	const pars = useParams<{project_id: string}>()
	const projectId = pars.project_id
	const {data: project, isLoading, error} = useProject(projectId)


	const nodes = useDesignerStore((state) => state.nodes);
	const edges = useDesignerStore((state) => state.edges);
	const { mutate: savePipeline, isPending: savingPending, error: saveError} = useUpdateWorkflow(projectId, {
		nodes,
		edges
	})


	const projectEditHeader: HeaderContent = {
		left: (
			<Group>
				<ActionIcon
					variant="subtle"
					aria-label="Settings"
					href={`/projects/${project?.id}`}
					component={Link}
				>
					<IconChevronLeft stroke={1.5} />
				</ActionIcon>
				<Flex align="center">
					<Text fz="h3">{project?.name}</Text>
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

				<Button onClick={() => savePipeline()} loading={savingPending} leftSection={<IconDeviceFloppy size={14} />}>
					Save Changes
				</Button>
			</Group>
		),
	};

	useHeader(projectEditHeader);
	//TODO : have this sent to supabase and it create a pipeline under a user. Agent should then be able to run it
	useEffect(() => useWorkflowDAG(), []);

	const { setDocked } = useNavBarState();

	useEffect(() => {
		setDocked(true);
		return () => setDocked(false);
	}, []);

	return (
		<Flex h="100%">
			<DnDProvider>
				<ReactFlowProvider>
					<ComponentList />
					<FlowCanvas />
				</ReactFlowProvider>
			</DnDProvider>
		</Flex>
	);
}
