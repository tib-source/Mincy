"use client";
import {
	Badge,
	Card,
	Group,
	Loader,
	Stack,
	Text,
	ThemeIcon,
} from "@mantine/core";
import {
	IconCircleCheck,
	IconCircleX,
	IconClock,
	IconGitBranch,
	IconLoader2,
	IconPlayerPlay,
	IconRocket,
	IconTerminal,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import type { PipelineRun } from "@/src/client/runs";
import { timeAgo } from "@/utils/api/helpers";
import { DataTable, type DataTableColumn } from "@/src/components/DataTable/DataTable";
import { getDuration } from "@/utils/helpers";
import classes from "./RunList.module.css";

const statusConfig: Record<
	string,
	{ color: string; icon: React.ReactNode; label: string }
> = {
	passed: {
		color: "var(--mantine-color-green-6)",
		icon: <IconCircleCheck size={18} color="var(--mantine-color-green-6)" />,
		label: "Success",
	},
	failed: {
		color: "var(--mantine-color-red-6)",
		icon: <IconCircleX size={18} color="var(--mantine-color-red-6)" />,
		label: "Failed",
	},
	running: {
		color: "var(--mantine-color-blue-5)",
		icon: (
			<IconLoader2
				size={18}
				color="var(--mantine-color-blue-5)"
				style={{ animation: "spin 1s linear infinite" }}
			/>
		),
		label: "Running",
	},
	queued: {
		color: "var(--mantine-color-yellow-5)",
		icon: <IconClock size={18} color="var(--mantine-color-yellow-5)" />,
		label: "Queued",
	},
	pending: {
		color: "var(--mantine-color-gray-5)",
		icon: <IconClock size={18} color="var(--mantine-color-gray-5)" />,
		label: "Pending",
	},
};

const triggerConfig: Record<string, { icon: React.ReactNode; label: string }> =
	{
		manual: { icon: <IconPlayerPlay size={14} />, label: "Manual" },
		push: { icon: <IconRocket size={14} />, label: "Push" },
		cron: { icon: <IconClock size={14} />, label: "Scheduled" },
	};

interface RunListProps {
	runs: PipelineRun[];
	projectId: string;
	isLoading?: boolean;
}

export function RunList({ runs, projectId, isLoading }: RunListProps) {
	const router = useRouter();

	if (isLoading) {
		return (
			<Stack align="center" gap="sm" py="xl">
				<Loader size="sm" type="dots" />
				<Text size="sm" c="dimmed">
					Loading runs...
				</Text>
			</Stack>
		);
	}

	if (runs.length === 0) {
		return (
			<Card padding="xl" radius="md" withBorder>
				<Stack align="center" gap="md" py="xl">
					<ThemeIcon size={48} variant="light" color="gray" radius="xl">
						<IconTerminal size={24} />
					</ThemeIcon>
					<Stack gap={4} align="center">
						<Text fw={500} size="sm">
							No runs yet
						</Text>
						<Text size="xs" c="dimmed">
							Trigger your first pipeline run to see results here.
						</Text>
					</Stack>
				</Stack>
			</Card>
		);
	}

	const columns: DataTableColumn<PipelineRun>[] = [
		{
			key: "status",
			label: "Status",
			width: 120,
			render: (run) => {
				const status = statusConfig[run.status] || statusConfig.pending;
				return (
					<div className={classes.statusCell}>
						<span className={classes.statusIcon}>{status.icon}</span>
						<span className={classes.statusText} style={{ color: status.color }}>
							{status.label}
						</span>
					</div>
				);
			},
		},
		{
			key: "commit",
			label: "Commit",
			render: (run) => (
				<>
					<div className={classes.commitMessage}>Run #{run.id.slice(0, 8)}</div>
					{run.commit_sha && (
						<div className={classes.commitSha}>{run.commit_sha.slice(0, 7)}</div>
					)}
				</>
			),
		},
		{
			key: "branch",
			label: "Branch",
			width: 150,
			render: (run) =>
				run.branch ? (
					<Badge
						variant="light"
						color="gray"
						size="sm"
						radius="sm"
						leftSection={<IconGitBranch size={11} />}
						tt="none"
						fw={400}
					>
						{run.branch}
					</Badge>
				) : (
					<span className={classes.time}>--</span>
				),
		},
		{
			key: "trigger",
			label: "Triggered By",
			width: 130,
			render: (run) => {
				const trigger = run.triggered_by ? triggerConfig[run.triggered_by] : null;
				return trigger ? (
					<Group gap={6} wrap="nowrap">
						{trigger.icon}
						<span style={{ fontSize: 13.5 }}>{trigger.label}</span>
					</Group>
				) : (
					<span className={classes.time}>--</span>
				);
			},
		},
		{
			key: "duration",
			label: "Duration",
			width: 100,
			render: (run) => (
				<span className={classes.mono}>
					{getDuration(new Date(run.created_at), run.finished_at ? new Date(run.finished_at) : undefined)}
				</span>
			),
		},
		{
			key: "time",
			label: "Time",
			width: 150,
			render: (run) => (
				<span className={classes.time}>{timeAgo(run.created_at)}</span>
			),
		},
	];

	return (
		<DataTable
			columns={columns}
			data={runs}
			getKey={(run) => run.id}
			onRowClick={(run) => router.push(`/projects/${projectId}/runs/${run.id}`)}
		/>
	);
}
