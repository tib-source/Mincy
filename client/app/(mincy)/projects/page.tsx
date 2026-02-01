"use client";
import {
	ActionIcon,
	Avatar,
	Badge,
	Box,
	Button,
	Card,
	Center,
	Container,
	Divider,
	Flex,
	Grid,
	Group,
	Loader,
	LoadingOverlay,
	rem,
	SimpleGrid,
	Stack,
	Text,
	Title,
	UnstyledButton,
} from "@mantine/core";
import { upperFirst, useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconBrandGithub, IconCircleX, IconGitCommit, IconLoader, IconLoader2, IconMedicalCrossCircle, IconPencil, IconPlus, IconTicket, IconX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ProjectCreateModal } from "@/src/components/ProjectCreateModal/ProjectCreateModal";
import { createClient } from "@/utils/supabase/client";
import { Tables } from "@mincy/shared";
import { useGithubRepo } from "@/src/hooks/query/github";
import { ProjectCard } from "@/src/components/ProjectCard/ProjectCard";
import { Suspense } from "react";
import { ProjectCardSkeleton } from "@/src/components/ProjectCard/ProjectCardSkeleton";

export default function ProjectsPage() {
	const [opened, { open, close }] = useDisclosure(false);
	const supabase = createClient();
	const { data, isLoading, error } = useQuery<Tables<'Projects'>[]>({
		queryKey: ["projects"],
		queryFn: async () => {
			const { data, error } = await supabase.from("Projects").select("*");
			if (error) throw error;
			return data;
		},
	});

	if (error) {
		console.log(error);

		notifications.show({
			message: error.message,
		});
	}

	return (
		<Container fluid pl="xl" pr={'xl'} pt={'lg'}>
			<ProjectCreateModal
				opened={opened}
				onClose={close}
				title="New Project"
				centered
			/>
			<Group
				justify="space-between"
			>
				<Stack gap={'sm'}>
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
			{data?.map((project, index) => 
				<Suspense fallback={<ProjectCardSkeleton/>}><ProjectCard project={project} key={project.name}/></Suspense>
			)}
			</SimpleGrid>
		</Container>
	);
}
