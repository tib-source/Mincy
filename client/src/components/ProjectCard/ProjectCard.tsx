import {
	Card,
	Stack,
	Text,
	Group,
	Box,
	Badge,
	Divider,
	Avatar,
	Loader,
} from "@mantine/core";
import { upperFirst } from "@mantine/hooks";
import {
	IconBrandGithub,
	IconCircleX,
	IconGitCommit,
	IconQuestionMark,
	IconTicket,
} from "@tabler/icons-react";
import Link from "next/link";
import type { JobStatus, Tables } from "@mincy/shared";
import type { GitHubRepo } from "@/src/client/gitClient";
import { timeAgo } from "@/utils/api/helpers";
import { ProjectCardSkeleton } from "./ProjectCardSkeleton";
import { useRecentProjectRuns } from "@/src/hooks/runs/useRuns";

interface ProjectCardProps {
	project: Tables<"Projects">;
	repoData?: GitHubRepo;
	isLoading?: boolean;
}

export function ProjectCard({ project, repoData, isLoading }: ProjectCardProps) {

	const statusColorMapping : Record<JobStatus, string> = {
		passed: "green",
		failed: "red",
		running: "orange",
		queued: "",
		completed: ""
	};

	const statusIconMapping = (status: JobStatus) => {
		switch (status) {
			case "passed":
				return <IconTicket size={15} strokeWidth={1} />;
			case "failed":
				return <IconCircleX size={15} strokeWidth={1} />;
			case "running":
				return <Loader size={12} strokeOpacity={0.5} />;
			default:
				return <IconQuestionMark size={15} strokeWidth={1} />;
		}
	}
	const { data: recentRuns, isLoading: isRecentRunLoading } = useRecentProjectRuns(project.id);
	const recentRun = recentRuns ? recentRuns[0] : null;
	if (isLoading) {
		return <ProjectCardSkeleton />;
	}

	return (
		<Card
			component={Link}
			href={`/projects/${project.id}`}
			padding="md"
			radius="md"
			withBorder
		>
			<Stack gap="md" p="sm">
				<Group justify="space-between">
					<Box>
						<Text fw={500} size="xl">
							{project.name}
						</Text>
						<Group gap={5} pt={3}>
							<IconBrandGithub size={15} strokeOpacity={0.5} />
							<Text c="dimmed" size="xs">
								{`${project.org}/${project.name}`}
							</Text>
						</Group>
					</Box>
					<Badge
						variant="light"
						tt="none"
						fw={100}
						color={statusColorMapping[recentRun?.status as JobStatus] || "gray"}
						size="lg"
						leftSection={statusIconMapping(recentRun?.status as JobStatus)}
					>
						{upperFirst(recentRun?.status) || "Unknown"}
					</Badge>
				</Group>
				<Text size="sm" c="dimmed" truncate="end" lineClamp={1}>
					{project.description}
				</Text>
				<Divider opacity={0.25} />
				<Group justify="space-between">
					<Group>
						<Avatar src={repoData?.owner?.avatar_url} size="sm" />
						<Text size="xs" c="dimmed">
							{timeAgo(repoData?.pushed_at || "")}
						</Text>
					</Group>
					<Badge
						h={30}
						variant="light"
						color="gray.9"
						radius="sm"
						leftSection={
							<IconGitCommit style={{ transform: "rotate(90deg)" }} />
						}
					>
						8c1d4e
					</Badge>
				</Group>
			</Stack>
		</Card>
	);
}
