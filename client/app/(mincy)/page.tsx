"use client";

import {
	Badge,
	Card,
	Center,
	Container,
	Group,
	Loader,
	Paper,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import {
	IconChartBar,
	IconCircleCheck,
	IconCircleX,
	IconClock,
	IconFolder,
	IconGitBranch,
	IconLoader2,
	IconPlayerPlay,
	IconRobot,
	IconRocket,
	IconTerminal,
} from "@tabler/icons-react";
import Link from "next/link";
import { useAllProjects } from "@/src/hooks/projects/useProject";
import { useRecentRuns } from "@/src/hooks/runs/useRuns";
import { useAgents } from "@/src/hooks/agents/useAgents";
import { timeAgo } from "@/utils/api/helpers";
import { getDuration } from "@/utils/helpers";
import type { PipelineRun } from "@/src/client/runs";

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
			<IconLoader2
				size={16}
				style={{ animation: "spin 1s linear infinite" }}
			/>
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

const triggerIcons: Record<string, React.ReactNode> = {
	manual: <IconPlayerPlay size={12} />,
	push: <IconRocket size={12} />,
	cron: <IconClock size={12} />,
};

interface StatCardProps {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	color: string;
	isLoading?: boolean;
}

function StatCard({ title, value, icon, color, isLoading }: StatCardProps) {
	return (
		<Card padding="lg" radius="md" withBorder>
			<Group justify="space-between" align="flex-start">
				<Stack gap={4}>
					<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
						{title}
					</Text>
					{isLoading ? (
						<Skeleton height={32} width={60} />
					) : (
						<Text size="xl" fw={700}>
							{value}
						</Text>
					)}
				</Stack>
				<ThemeIcon size={42} variant="light" color={color} radius="md">
					{icon}
				</ThemeIcon>
			</Group>
		</Card>
	);
}

function RunRow({ run }: { run: PipelineRun }) {
	const status = statusConfig[run.status] || statusConfig.pending;

	return (
		<Paper
			component={Link}
			href={run.project_id ? `/projects/${run.project_id}/runs/${run.id}` : "#"}
			p="sm"
			radius="sm"
			withBorder
			style={{ textDecoration: "none", cursor: "pointer" }}
		>
			<Group justify="space-between" wrap="nowrap">
				<Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
					<Badge
						variant="light"
						color={status.color}
						size="sm"
						leftSection={status.icon}
						tt="none"
						fw={500}
					>
						{status.label}
					</Badge>
					<Text size="sm" fw={500} truncate>
						Run #{run.id.slice(0, 8)}
					</Text>
					{run.branch && (
						<Badge
							variant="light"
							color="gray"
							size="xs"
							radius="sm"
							leftSection={<IconGitBranch size={10} />}
							tt="none"
							fw={400}
						>
							{run.branch}
						</Badge>
					)}
				</Group>
				<Group gap="md" wrap="nowrap">
					{run.triggered_by && (
						<Group gap={4} wrap="nowrap">
							{triggerIcons[run.triggered_by]}
							<Text size="xs" c="dimmed">
								{run.triggered_by}
							</Text>
						</Group>
					)}
					<Text size="xs" c="dimmed" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
						{getDuration(new Date(run.created_at), run.finished_at ? new Date(run.finished_at) : undefined)}
					</Text>
					<Text size="xs" c="dimmed" w={100} ta="right">
						{timeAgo(run.created_at)}
					</Text>
				</Group>
			</Group>
		</Paper>
	);
}

export default function HomePage() {
	const { data: projects, isLoading: projectsLoading } = useAllProjects();
	const { data: runs, isLoading: runsLoading } = useRecentRuns(10);
	const { data: agents, isLoading: agentsLoading } = useAgents();

	const activeAgents = agents?.filter((a) => a.status === "active").length ?? 0;
	const passedRuns = runs?.filter((r) => r.status === "passed").length ?? 0;
	const failedRuns = runs?.filter((r) => r.status === "failed").length ?? 0;

	return (
		<Container fluid pl="xl" pr="xl" pt="lg">
			<Stack gap="lg">
				<Stack gap="sm">
					<Title order={1}>Dashboard</Title>
					<Text c="dimmed">Overview of your CI/CD pipelines.</Text>
				</Stack>

				<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
					<StatCard
						title="Projects"
						value={projects?.length ?? 0}
						icon={<IconFolder size={22} />}
						color="ember"
						isLoading={projectsLoading}
					/>
					<StatCard
						title="Active Agents"
						value={activeAgents}
						icon={<IconRobot size={22} />}
						color="blue"
						isLoading={agentsLoading}
					/>
					<StatCard
						title="Passed (recent)"
						value={passedRuns}
						icon={<IconCircleCheck size={22} />}
						color="green"
						isLoading={runsLoading}
					/>
					<StatCard
						title="Failed (recent)"
						value={failedRuns}
						icon={<IconCircleX size={22} />}
						color="red"
						isLoading={runsLoading}
					/>
				</SimpleGrid>

				<SimpleGrid cols={{ base: 1, lg: 2 }}>
					{/* Recent Runs */}
					<Card padding="lg" radius="md" withBorder>
						<Stack gap="md">
							<Group justify="space-between">
								<Text fw={600}>Recent Runs</Text>
								<Text
									component={Link}
									href="/projects"
									size="xs"
									c="dimmed"
									style={{ textDecoration: "none" }}
								>
									View all
								</Text>
							</Group>

							{runsLoading ? (
								<Center py="xl">
									<Loader type="dots" size="sm" />
								</Center>
							) : runs && runs.length > 0 ? (
								<Stack gap="xs">
									{runs.map((run) => (
										<RunRow key={run.id} run={run} />
									))}
								</Stack>
							) : (
								<Stack align="center" gap="sm" py="xl">
									<ThemeIcon size={40} variant="light" color="gray" radius="xl">
										<IconTerminal size={20} />
									</ThemeIcon>
									<Text size="sm" c="dimmed">
										No pipeline runs yet.
									</Text>
								</Stack>
							)}
						</Stack>
					</Card>

					{/* Graph Placeholder */}
					<Card padding="lg" radius="md" withBorder>
						<Stack gap="md" h="100%">
							<Text fw={600}>Pipeline Activity</Text>
							<Center
								style={{
									flex: 1,
									minHeight: 300,
									border: "1px dashed var(--mantine-color-gray-4)",
									borderRadius: "var(--mantine-radius-md)",
								}}
							>
								<Stack align="center" gap="sm">
									<ThemeIcon size={48} variant="light" color="gray" radius="xl">
										<IconChartBar size={24} />
									</ThemeIcon>
									<Text size="sm" c="dimmed" ta="center">
										Pipeline activity graph
										<br />
										coming soon
									</Text>
								</Stack>
							</Center>
						</Stack>
					</Card>
				</SimpleGrid>
			</Stack>
		</Container>
	);
}
