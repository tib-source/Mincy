"use client";

import { useEffect } from "react";
import { ActionIcon, Button, Flex, Group, Text } from "@mantine/core";
import {
	IconArrowBackUp,
	IconChevronLeft,
	IconDeviceFloppy,
	IconSquareRoundedCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import { FlowCanvas } from "@/src/components/Canvas/FlowCanvas";
import { ComponentList } from "@/src/components/ComponentList/ComponentList";
import type { HeaderContent } from "@/src/context/HeaderContext";
import { useHeader } from "@/src/hooks/useHeader";
import { useDesignerStore, useNavBarState } from "@/src/store/store";
import { DnDProvider } from "@/src/context/DnDContext";
import { ReactFlowProvider } from "@xyflow/react";
import { useProject } from "@/src/hooks/projects/useProject";
import { useParams } from "next/navigation";
import { useUpdateWorkflow } from "@/src/hooks/workflows/useUpdateWorkflow";
import { notifications } from "@mantine/notifications";

export default function ProjectEditPage() {
	const pars = useParams<{ project_id: string }>();
	const projectId = pars.project_id;
	const { data: project, error } = useProject(projectId);

	const nodes = useDesignerStore((state) => state.nodes);
	const edges = useDesignerStore((state) => state.edges);
	const {
		mutate: savePipeline,
		isPending: savingPending,
		isSuccess,
	} = useUpdateWorkflow(projectId, {
		nodes,
		edges,
	});
	useEffect(() => {
		if (error) {
			notifications.show({ message: error.message, color: "red" });
		}
	}, [error]);

	useEffect(() => {
		if (isSuccess) {
			notifications.show({
				title: "Project Saved",
				message: "Local changes saved successfully",
				color: "green",
			});
		}
	}, [isSuccess]);

	const projectEditHeader: HeaderContent = {
		left: (
			<Group>
				<ActionIcon
					variant="subtle"
					aria-label="Settings"
					href={`/projects/${projectId}`}
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
				<Button
					onClick={() => savePipeline()}
					loading={savingPending}
					leftSection={<IconDeviceFloppy size={14} />}
				>
					Save Changes
				</Button>
			</Group>
		),
	};

	useHeader(projectEditHeader);

	const { setDocked } = useNavBarState();

	useEffect(() => {
		setDocked(true);
		return () => setDocked(false);
	}, [setDocked]);

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
