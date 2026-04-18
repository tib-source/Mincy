"use client";
import {
	Anchor,
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
	IconTag,
	IconTerminal,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import type { PipelineRun } from "@/src/client/runs";
import { timeAgo } from "@/utils/api/helpers";
import {
	DataTable,
	type DataTableColumn,
} from "@/src/components/DataTable/DataTable";
import { getDuration } from "@/utils/helpers";

type TriggerContext = Record<string, unknown> | null;

function ctx(run: PipelineRun): TriggerContext {
	return run.trigger_context as TriggerContext;
}

const statusConfig: Record<
	string,
	{ color: string; icon: React.ReactNode; label: string }
> = {
	passed: {
		color: "green",
		icon: <IconCircleCheck size={16} />,
		label: "Success",
	},
	failed: {
		color: "red",
		icon: <IconCircleX size={16} />,
		label: "Failed",
	},
	running: {
		color: "blue",
		icon: (
			<IconLoader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
		),
		label: "Running",
	},
	queued: {
		color: "yellow",
		icon: <IconClock size={16} />,
		label: "Queued",
	},
	pending: {
		color: "gray",
		icon: <IconClock size={16} />,
		label: "Pending",
	},
};

const triggerConfig: Record<
	string,
	{ color: string; icon: React.ReactNode; label: string }
> = {
	manual: {
		color: "violet",
		icon: <IconPlayerPlay size={12} />,
		label: "Manual",
	},
	commit: { color: "blue", icon: <IconRocket size={12} />, label: "Push" },
	tag: { color: "teal", icon: <IconTag size={12} />, label: "Tag" },
	cron: { color: "orange", icon: <IconClock size={12} />, label: "Scheduled" },
};

interface RunListProps {
	runs: PipelineRun[];
	projectId: string;
	isLoading?: boolean;
	projectNames?: Map<string, string>;
}

export function RunList({
	runs,
	projectId,
	isLoading,
	projectNames,
}: RunListProps) {
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
					<Badge
						variant="light"
						color={status.color}
						size="sm"
						radius="sm"
						leftSection={status.icon}
						tt="none"
						fw={500}
					>
						{status.label}
					</Badge>
				);
			},
		},
		...(projectNames
			? [
					{
						key: "project",
						label: "Project",
						width: 300,
						render: (run: PipelineRun) => (
							<Text size="xs" fw={500}>
								{(run.project_id && projectNames.get(run.project_id)) || "–"}
							</Text>
						),
					},
				]
			: []),
		{
			key: "commit",
			label: "Commit",
			render: (run) => {
				const c = ctx(run);
				const sha = c?.sha as string | undefined;
				const message = c?.message as string | undefined;
				const tag = c?.tag as string | undefined;
				const repoUrl = c?.url as string | undefined;

				let shaElement: React.ReactNode = null;
				if (sha && repoUrl) {
					shaElement = (
						<Anchor
							href={`${repoUrl}/commit/${sha}`}
							target="_blank"
							size="xs"
							c="dimmed"
							w="fit-content"
							onClick={(e) => e.stopPropagation()}
						>
							{sha.slice(0, 7)}
						</Anchor>
					);
				} else if (sha) {
					shaElement = (
						<Text size="xs" c="dimmed" ff="monospace">
							{sha.slice(0, 7)}
						</Text>
					);
				}

				const label =
					run.triggered_by === "tag" && tag
						? tag
						: message || `Run #${run.id.slice(0, 8)}`;

				return (
					<Stack gap={2}>
						<Text size="xs" fw={500} lineClamp={1}>
							{label}
						</Text>
						{shaElement}
					</Stack>
				);
			},
		},
		{
			key: "branch",
			label: "Branch",
			render: (run) => {
				const c = ctx(run);
				if (!c || run.triggered_by === "tag") {
					return (
						<Text size="xs" c="dimmed">
							--
						</Text>
					);
				}

				const branch = (c.branch as string) || (c.ref as string);
				if (!branch) {
					return (
						<Text size="xs" c="dimmed">
							--
						</Text>
					);
				}

				return (
					<Group gap={4} wrap="nowrap">
						<IconGitBranch size={13} />
						<Text size="xs" c="dimmed" truncate>
							{branch}
						</Text>
					</Group>
				);
			},
		},
		{
			key: "trigger",
			label: "Trigger",
			render: (run) => {
				const trigger = run.triggered_by
					? triggerConfig[run.triggered_by]
					: null;
				if (!trigger) {
					return (
						<Text size="xs" c="dimmed">
							--
						</Text>
					);
				}
				return (
					<Badge
						variant="light"
						color={trigger.color}
						size="sm"
						radius="sm"
						leftSection={trigger.icon}
						tt="none"
						fw={400}
					>
						{trigger.label}
					</Badge>
				);
			},
		},
		{
			key: "duration",
			label: "Duration",
			width: 100,
			render: (run) => (
				<Text size="xs" c="dimmed">
					{getDuration(
						new Date(run.created_at),
						run.finished_at ? new Date(run.finished_at) : undefined,
					)}
				</Text>
			),
		},
		{
			key: "time",
			label: "Time",
			width: 150,
			render: (run) => (
				<Text size="xs" c="dimmed">
					{timeAgo(run.created_at)}
				</Text>
			),
		},
	];

	return (
		<DataTable
			columns={columns}
			data={runs}
			getKey={(run) => run.id}
			onRowClick={(run) => {
				const pid = run.project_id || projectId;
				router.push(`/projects/${pid}/runs/${run.id}`);
			}}
		/>
	);
}
