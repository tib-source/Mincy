"use client";
import {
	ActionIcon,
	Badge,
	Container,
	Group,
	Loader,
	Stack,
	Tabs,
	Text,
	UnstyledButton,
} from "@mantine/core";
import {
	IconChevronLeft,
	IconChevronRight,
	IconCircleCheck,
	IconCircleDot,
	IconCircleX,
	IconClock,
	IconGitCommit,
	IconLoader2,
	IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useRun, useRunLogs } from "@/src/hooks/runs/useRuns";
import { useProject } from "@/src/hooks/projects/useProject";
import { useWorkflow } from "@/src/hooks/workflows/useWorkflows";
import { LogViewer } from "@/src/components/LogViewer/LogViewer";
import { useHeader } from "@/src/hooks/useHeader";
import type { HeaderContent } from "@/src/context/HeaderContext";
import type { LogEntry } from "@/src/client/runs";
import classes from "./RunDetail.module.css";
import { getDuration } from "@/utils/helpers";
import type { Stage, Step } from "@mincy/shared";
import { FlowCanvas } from "@/src/components/Canvas/FlowCanvas";
import { ReactFlowProvider } from "@xyflow/react";

export const statusConfig: Record<
	string,
	{ color: string; icon: React.ReactNode; label: string }
> = {
	passed: {
		color: "green",
		icon: <IconCircleCheck size={16} />,
		label: "Passed",
	},
	failed: { color: "red", icon: <IconCircleX size={16} />, label: "Failed" },
	running: {
		color: "blue",
		icon: (
			<IconLoader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
		),
		label: "Running",
	},
	queued: { color: "yellow", icon: <IconClock size={16} />, label: "Queued" },
	pending: { color: "gray", icon: <IconClock size={16} />, label: "Pending" },
};

function StatusIcon({ status, size = 18 }: { status: string; size?: number }) {
	switch (status) {
		case "passed":
			return (
				<IconCircleCheck size={size} color="var(--mantine-color-green-6)" />
			);
		case "failed":
			return <IconCircleX size={size} color="var(--mantine-color-red-6)" />;
		case "running":
			return (
				<IconLoader2
					size={size}
					color="var(--mantine-color-blue-5)"
					style={{ animation: "spin 1s linear infinite" }}
				/>
			);
		default:
			return <IconCircleDot size={size} color="var(--mantine-color-gray-5)" />;
	}
}

function parseStages(workflow: Record<string, unknown> | undefined): Stage[] {
	const rawJobs = workflow?.jobs;
	if (!rawJobs) {
		return [];
	}
	try {
		const jobs = typeof rawJobs === "string" ? JSON.parse(rawJobs) : rawJobs;
		if ((jobs as any).stages) {
			return (jobs as any).stages as Stage[];
		}
		const steps = ((jobs as any).steps || []) as Step[];
		return steps.map((s) => ({
			id: s.id,
			name: (s.data?.label as string) || s.type || s.id,
			image: "debian:latest",
			steps: [s],
			dependsOn: s.dependsOn || [],
		}));
	} catch {
		return [];
	}
}

function deriveStageStatus(
	stageId: string,
	runStatus: string,
	allStages: Stage[],
	logsJobIds: Set<string>,
): string {
	const stage = allStages.find((s) => s.id === stageId);
	const stepIds = stage?.steps.map((s) => s.id) || [stageId];
	const hasLogs = stepIds.some((id) => logsJobIds.has(id));

	if (runStatus === "passed") {
		return "passed";
	}
	if (runStatus === "failed") {
		const stagesWithLogs = allStages.filter((s) =>
			s.steps.some((step) => logsJobIds.has(step.id)),
		);
		const lastWithLogs = stagesWithLogs[stagesWithLogs.length - 1];
		if (lastWithLogs?.id === stageId) {
			return "failed";
		}
		return hasLogs ? "passed" : "pending";
	}
	if (runStatus === "running") {
		const stagesWithLogs = allStages.filter((s) =>
			s.steps.some((step) => logsJobIds.has(step.id)),
		);
		const lastWithLogs = stagesWithLogs[stagesWithLogs.length - 1];
		if (lastWithLogs?.id === stageId) {
			return "running";
		}
		return hasLogs ? "passed" : "pending";
	}
	return "pending";
}

function filterLogsForStage(
	logs: LogEntry[],
	stage: Stage | undefined,
): LogEntry[] {
	if (!stage) {
		return logs;
	}
	const stepIds = new Set(stage.steps.map((s) => s.id));
	return logs.filter((l) => l.job_id && stepIds.has(l.job_id));
}

function StageItem({
	stage,
	status,
	active,
	onClick,
}: {
	stage: Stage;
	status: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<UnstyledButton
			className={classes.stageItem}
			data-active={active}
			onClick={onClick}
		>
			<span className={classes.stageIcon}>
				<StatusIcon status={status} />
			</span>
			<div style={{ flex: 1, minWidth: 0 }}>
				<div className={classes.stageName}>{stage.name}</div>
				<div className={classes.stageMeta}>
					{stage.steps.length} step{stage.steps.length !== 1 ? "s" : ""} ·{" "}
					{stage.image}
				</div>
			</div>
			<IconChevronRight
				size={14}
				color="var(--mantine-color-dimmed)"
				style={{ flexShrink: 0 }}
			/>
		</UnstyledButton>
	);
}

const triggerLabels: Record<string, string> = {
	manual: "Manual",
	push: "Push",
	cron: "Cron",
};

export default function RunDetailPage() {
	const params = useParams<{ project_id: string; run_id: string }>();
	const { data: project } = useProject(params.project_id);
	const { data: run, isLoading: runLoading } = useRun(params.run_id);
	const { data: logs = [], isLoading: logsLoading } = useRunLogs(params.run_id);
	const { data: workflow } = useWorkflow(project?.id as string);

	const [activeStageId, setActiveStageId] = useState<string | null>(null);

	const status = statusConfig[run?.status || "pending"] || statusConfig.pending;
	const isLive = run?.status === "running" || run?.status === "queued";

	const stages = parseStages(workflow as Record<string, unknown> | undefined);
	const logsJobIds = new Set(
		logs.map((l) => l.job_id).filter(Boolean) as string[],
	);

	const activeStage = stages.find((s) => s.id === activeStageId);
	const filteredLogs = filterLogsForStage(logs, activeStage);

	const header: HeaderContent = {
		left: (
			<Group gap="xs">
				<ActionIcon
					variant="subtle"
					href={`/projects/${params.project_id}`}
					component={Link}
				>
					<IconChevronLeft stroke={1.5} />
				</ActionIcon>
				<Text size="sm" c="dimmed">
					Projects
				</Text>
				<Text size="sm" c="dimmed">
					&gt;
				</Text>
				<Text size="sm" fw={500}>
					{project?.name || "Project"}
				</Text>
			</Group>
		),
	};
	useHeader(header);

	if (runLoading) {
		return (
			<Container fluid p="lg">
				<Stack align="center" py="xl">
					<Loader size="sm" type="dots" />
				</Stack>
			</Container>
		);
	}

	if (!run) {
		return (
			<Container fluid p="lg">
				<Text c="dimmed">Run not found.</Text>
			</Container>
		);
	}

	return (
		<Stack gap={0} h="100%">
			<Stack gap="sm" px="lg" pt="lg" pb="md">
				<Group gap="sm" align="center">
					<Text size="xl" fw={600}>
						Run #{run.id.slice(0, 8)}
						{run.branch ? `: ${run.branch}` : ""}
					</Text>
					<Badge
						variant="light"
						color={status.color}
						size="lg"
						tt="none"
						fw={500}
						leftSection={status.icon}
					>
						{status.label}
					</Badge>
				</Group>

				<Group gap="lg">
					{run.commit_sha && (
						<Group gap={6}>
							<IconGitCommit
								size={15}
								color="var(--mantine-color-dimmed)"
								style={{ transform: "rotate(90deg)" }}
							/>
							<Text size="sm" c="dimmed" ff="monospace">
								{run.commit_sha.slice(0, 7)}
							</Text>
						</Group>
					)}
					<Group gap={6}>
						<IconUser size={15} color="var(--mantine-color-dimmed)" />
						<Text size="sm" c="dimmed">
							{run.triggered_by
								? triggerLabels[run.triggered_by] || run.triggered_by
								: "Manual"}
						</Text>
					</Group>
					<Group gap={6}>
						<IconClock size={15} color="var(--mantine-color-dimmed)" />
						<Text size="sm" c="dimmed">
							{getDuration(
								new Date(run.created_at),
								run.finished_at ? new Date(run.finished_at) : undefined,
							)}
						</Text>
					</Group>
				</Group>
			</Stack>

			<Tabs
				defaultValue="overview"
				variant="default"
				classNames={{ list: classes.tabs }}
				style={{
					flex: 1,
					minHeight: 0,
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Tabs.List px="lg">
					<Tabs.Tab value="overview">Overview</Tabs.Tab>
					<Tabs.Tab value="pipeline">Pipeline</Tabs.Tab>
					<Tabs.Tab value="artifacts">Artifacts</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel
					value="overview"
					style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}
				>
					<div className={classes.splitLayout}>
						<div className={classes.stagesSidebar}>
							<div className={classes.stagesTitle}>Stages</div>

							<UnstyledButton
								className={classes.stageItem}
								data-active={activeStageId === null}
								onClick={() => setActiveStageId(null)}
							>
								<span className={classes.stageIcon}>{status.icon}</span>
								<div>
									<div className={classes.stageName}>All Stages</div>
									<div className={classes.stageMeta}>{logs.length} lines</div>
								</div>
							</UnstyledButton>

							{stages.map((stage) => (
								<StageItem
									key={stage.id}
									stage={stage}
									status={deriveStageStatus(
										stage.id,
										run.status,
										stages,
										logsJobIds,
									)}
									active={activeStageId === stage.id}
									onClick={() => setActiveStageId(stage.id)}
								/>
							))}

							{stages.length === 0 && (
								<Text size="xs" c="dimmed" px="lg" py="sm">
									No stages available.
								</Text>
							)}
						</div>

						<div className={classes.logsPanel}>
							<LogViewer
								logs={filteredLogs}
								isLoading={logsLoading}
								isLive={isLive}
								title={activeStage?.name || "All Stages"}
								subtitle={`${filteredLogs.length} lines`}
							/>
						</div>
					</div>
				</Tabs.Panel>

				<Tabs.Panel value="pipeline" className={classes.pipelinePanel}>
					<ReactFlowProvider>
						<FlowCanvas />
					</ReactFlowProvider>
				</Tabs.Panel>

				<Tabs.Panel value="artifacts" p="lg">
					<Stack align="center" py="xl">
						<Text c="dimmed" size="sm">
							No artifacts for this run.
						</Text>
					</Stack>
				</Tabs.Panel>
			</Tabs>
		</Stack>
	);
}
