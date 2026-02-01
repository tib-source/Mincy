import { useGithubRepo } from "@/src/hooks/query/github";
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
	LoadingOverlay,
} from "@mantine/core";
import { upperFirst } from "@mantine/hooks";
import {
	IconBrandGithub,
	IconCircleX,
	IconGitCommit,
	IconTicket,
} from "@tabler/icons-react";
import Link from "next/link";
import type { Tables } from "@mincy/shared";
import { timeAgo } from "@/utils/api/helpers";
import { Suspense } from "react";

interface ProjectCardProps {
	project: Tables<"Projects">;
}

export function ProjectCard({ project }: ProjectCardProps) {
	const { data: repoData } = useGithubRepo(project.org, project.name);

	const statusColorMapping = {
		passing: "green",
		failing: "red",
		running: "orange",
	};

	const statusIconMapping = {
		passing: <IconTicket size={15} strokeWidth={1} />,
		failing: <IconCircleX size={15} strokeWidth={1} />,
		running: <Loader size={12} strokeOpacity={0.5} />,
	};

	return (
		<Card
			component={Link}
			href={`/projects/${project.name}`}
			padding="md"
			radius="md"
			withBorder
		>
			<Stack gap={"md"} p={"sm"}>
				<Group justify="space-between">
					<Box>
						<Text fw={500} size="xl">
							{project.name}
						</Text>
						<Group gap={5} pt={3}>
							<IconBrandGithub size={15} strokeOpacity={0.5} />
							<Text
								c="dimmed"
								component={Link}
								size={"xs"}
								href={"https://github.com/" + `${project.org}/${project.name}`}
							>
								{project.org + "/" + project.name}
							</Text>
						</Group>
					</Box>
					<Badge
						variant="light"
						tt="none"
						fw={100}
						color={statusColorMapping[project.status]}
						size="lg"
						leftSection={statusIconMapping[project.status]}
					>
						{upperFirst(project.status)}
					</Badge>
				</Group>
				<Text size="sm" c="dimmed" truncate="end" lineClamp={1}>
					{project.description}
				</Text>
				<Divider opacity={0.25} />
				<Group justify="space-between">
					<Group>
						<Avatar src={repoData?.owner?.avatar_url} size={"sm"} />
						<Text size="xs" c={"dimmed"}>
							{timeAgo(repoData?.pushed_at)}
						</Text>
					</Group>
					<Badge
						h={30}
						variant={"light"}
						color="gray.9"
						radius={"sm"}
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
