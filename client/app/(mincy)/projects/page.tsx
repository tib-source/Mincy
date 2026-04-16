"use client";
import {
	Button,
	Center,
	Container,
	Group,
	Loader,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { ProjectCreateModal } from "@/src/components/ProjectCreateModal/ProjectCreateModal";
import { ProjectCard } from "@/src/components/ProjectCard/ProjectCard";
import { useAllProjects } from "@/src/hooks/projects/useProject";
import { useGithubRepos } from "@/src/hooks/github/useGithubRepos";
import { useMemo } from "react";
import type { GitHubRepo } from "@/src/client/gitClient";

export default function ProjectsPage() {
	const [opened, { open, close }] = useDisclosure(false);
	const { data, isLoading, error } = useAllProjects();
	const { data: repos, isLoading: isLoadingRepos } = useGithubRepos();

	const repoMap = useMemo(() => {
		const map = new Map<string, GitHubRepo>();
		if (!repos) {
			return map;
		}
		for (const repo of repos) {
			map.set(`${repo.owner.login}/${repo.name}`, repo);
		}
		return map;
	}, [repos]);

	if (error) {
		notifications.show({
			message: error.message,
		});
	}

	return (
		<Container fluid pl="xl" pr="xl" pt="lg">
			<ProjectCreateModal
				opened={opened}
				onClose={close}
				title="New Project"
				centered
			/>
			<Group justify="space-between">
				<Stack gap="sm">
					<Title order={1}>Projects</Title>
					<Text>Manage and monitor your CI/CD pipelines.</Text>
				</Stack>
				<Button onClick={open}>
					<IconPlus />
					New Project
				</Button>
			</Group>

			{isLoading && (
				<Center>
					<Loader type="dots" />
				</Center>
			)}

			<SimpleGrid mt="sm" cols={2}>
				{data?.map((project) => (
					<ProjectCard
						key={project.id}
						project={project}
						repoData={repoMap.get(`${project.org}/${project.name}`)}
						isLoading={isLoadingRepos}
					/>
				))}
			</SimpleGrid>
		</Container>
	);
}
