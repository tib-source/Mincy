"use client";
import {
	Badge,
	Button,
	Card,
	Center,
	Container,
	Flex,
	Group,
	Loader,
	Text,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ProjectCreateModal } from "@/src/components/ProjectCreateModal/ProjectCreateModal";
import { createClient } from "@/utils/supabase/client";

export default function ProjectsPage() {
	const [opened, { open, close }] = useDisclosure(false);
	const supabase = createClient();
	const { data, isLoading, error } = useQuery({
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
		<Container fluid>
			<ProjectCreateModal
				opened={opened}
				onClose={close}
				title="New Project"
				centered
			/>
			<Group
				justify="space-between"
				styles={{
					root: {
						marginTop: "1rem",
						marginBottom: "1rem",
					},
				}}
			>
				<div>
					<Title order={1}>Projects</Title>
					<Text>Manage and monitor your CI/CD pipelines.</Text>
				</div>
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

			{data?.map((project, index) => {
				return (
					<Flex mt={10} key={index}>
						<Card shadow="sm" padding="lg" radius="md" withBorder>
							<Group justify="space-between" mt="md" mb="xs">
								<Text fw={500}>{project.name}</Text>
								<Badge color="green">Passing</Badge>
							</Group>

							<Text size="sm" c="dimmed">
								{project.description}
							</Text>

							<Flex>
								<Button color="blue" fullWidth mt="md" radius="md">
									View Runs
								</Button>
								<Link href={`/projects/${project.id}/edit`}>
									<IconPencil stroke={1} />
								</Link>
							</Flex>
						</Card>
					</Flex>
				);
			})}
		</Container>
	);
}
