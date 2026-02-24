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
import { useQuery } from "@tanstack/react-query";
import { ProjectCreateModal } from "@/src/components/ProjectCreateModal/ProjectCreateModal";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@mincy/shared";
import { ProjectCard } from "@/src/components/ProjectCard/ProjectCard";
import { useAllProjects } from "@/src/hooks/projects/useProject";

export default function ProjectsPage() {
	const [opened, { open, close }] = useDisclosure(false);
	const supabase = createClient();
	const { data, isLoading, error } = useAllProjects()

	if (error) {
		console.log(error);

		notifications.show({
			message: error.message,
		});
	}

	return (
		<Container fluid pl="xl" pr={"xl"} pt={"lg"}>
			<ProjectCreateModal
				opened={opened}
				onClose={close}
				title="New Project"
				centered
			/>
			<Group justify="space-between">
				<Stack gap={"sm"}>
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

			<SimpleGrid mt={"sm"} cols={2}>
				{data?.map((project) => (
					<ProjectCard key={project.id} project={project} />
				))}
			</SimpleGrid>
		</Container>
	);
}
