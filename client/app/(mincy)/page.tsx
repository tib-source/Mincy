"use client";

import { useMemo } from "react";
import { Container, Flex, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import {
	IconCircleCheck,
	IconFolder,
	IconRobot,
} from "@tabler/icons-react";
import { useAllProjects } from "@/src/hooks/projects/useProject";
import { useRecentRuns } from "@/src/hooks/runs/useRuns";
import { useAgents } from "@/src/hooks/agents/useAgents";
import { StatCard } from "@/src/components/StatCard/StatCard";
import { RunList } from "@/src/components/RunList/RunList";

export default function HomePage() {
	const { data: projects, isLoading: projectsLoading } = useAllProjects();
	const { data: runs, isLoading: runsLoading } = useRecentRuns(10);
	const { data: agents, isLoading: agentsLoading } = useAgents();

	const projectNames = useMemo(() => {
		const map = new Map<string, string>();
		for (const p of projects ?? []) {
			map.set(p.id, p.name);
		}
		return map;
	}, [projects]);

	const activeAgents =
		agents?.filter((a) => a.status === "active").length ?? 0;
	const passedRuns =
		runs?.filter((r) => r.status === "passed").length ?? 0;
	const successRate =
		runs && runs.length > 0
			? Math.round((passedRuns / runs.length) * 100)
			: 0;

	return (
		<Container fluid pl="xl" pr="xl" pt="lg">
			<Stack gap="lg">
				<Stack gap="sm">
					<Title order={1}>Dashboard</Title>
					<Text c="dimmed">Overview of your CI/CD pipelines.</Text>
				</Stack>

				<Flex gap="lg" wrap="wrap">
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
						title="Success Rate"
						value={`${successRate}%`}
						icon={<IconCircleCheck size={22} />}
						color="green"
						isLoading={runsLoading}
					/>
				</Flex>

				<RunList
					runs={runs ?? []}
					projectId=""
					isLoading={runsLoading}
					projectNames={projectNames}
				/>
			</Stack>
		</Container>
	);
}
