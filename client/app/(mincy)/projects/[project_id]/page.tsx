"use client";
import {
	ActionIcon,
	Badge,
	Button,
	Container,
	Flex,
	Group,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import {
	IconChevronLeft,
	IconCircleCheck,
	IconPencil,
	IconPlayerPlay,
} from "@tabler/icons-react";
import Link from "next/link";
import { useProject } from "@/src/hooks/projects/useProject";
import { useParams } from "next/navigation";
import { useRunWorkflow } from "@/src/hooks/workflows/useRunPipeline";
import { useWorkflow } from "@/src/hooks/workflows/useWorkflows";
import { useProjectRuns } from "@/src/hooks/runs/useRuns";
import { RunList } from "@/src/components/RunList/RunList";
import { useHeader } from "@/src/hooks/useHeader";
import type { HeaderContent } from "@/src/context/HeaderContext";
import { useEffect } from "react";
import { notifications } from "@mantine/notifications";
import type { PipelineRun } from "@/src/client/runs";
export default function ProjectPage() {
	const pars = useParams<{ project_id: string }>();
	const projectId = pars.project_id;
	const { data: project } = useProject(projectId);
	const { data: workflow } = useWorkflow(projectId);
	const runWorkflow = useRunWorkflow(projectId, workflow?.id ?? "", "manual");
	const { data: runs, isLoading: runsLoading } = useProjectRuns(project?.id);

	const header: HeaderContent = {
		left: (
			<Group>
				<ActionIcon variant="subtle" href="/projects" component={Link}>
					<IconChevronLeft stroke={1.5} />
				</ActionIcon>
				<Text fz="h3">{project?.name || "Project"}</Text>
			</Group>
		),
	};

	useHeader(header);

	useEffect(() => {
		if (runWorkflow.isError) {
			notifications.show({
				title: "Error",
				message: runWorkflow.error?.message || "Failed to run workflow",
				color: "red",
			});
		}
	}, [runWorkflow.isError, runWorkflow.error]);

	return (
		<Container fluid p="lg">
			<Stack gap="lg">
				<Flex justify="space-between" align="flex-start">
					<Stack gap={4}>
						<Group gap="sm">
							<Title order={2} fw={600}>
								{project?.name || "Project"}
							</Title>
							<Badge
								variant="light"
								color="green"
								size="lg"
								tt="none"
								fw={500}
								leftSection={<IconCircleCheck size={14} />}
							>
								Passing
							</Badge>
						</Group>
						<Text size="sm" c="dimmed">
							{project?.description ||
								`${project?.org || ""}/${project?.name || ""}`}
						</Text>
					</Stack>

					<Group gap="xs">
						<Button
							component={Link}
							href={`/projects/${project?.id}/edit`}
							variant="default"
							leftSection={<IconPencil size={14} />}
						>
							Settings
						</Button>
						<Button
							onClick={() => runWorkflow.mutate()}
							loading={runWorkflow.isPending}
							leftSection={<IconPlayerPlay size={14} />}
						>
							Run Pipeline
						</Button>
					</Group>
				</Flex>

				<RunList
					runs={(runs as PipelineRun[]) || []}
					projectId={projectId}
					isLoading={runsLoading}
				/>
			</Stack>
		</Container>
	);
}
