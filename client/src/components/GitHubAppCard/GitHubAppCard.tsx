"use client";

import {
	Avatar,
	Badge,
	Button,
	Card,
	Divider,
	Group,
	Skeleton,
	Stack,
	Text,
} from "@mantine/core";
import {
	IconBrandGithub,
	IconCheck,
	IconExternalLink,
} from "@tabler/icons-react";
import { useGithubAppInstallation } from "@/src/hooks/github/useGithubAppInstallation";

const GITHUB_APP_SLUG = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;

export function GitHubAppCard() {
	const { data: installation, isLoading } = useGithubAppInstallation();

	const installUrl = GITHUB_APP_SLUG
		? `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`
		: null;

	if (isLoading) {
		return (
			<Card>
				<Stack gap="sm">
					<Skeleton height={20} width={200} />
					<Skeleton height={14} width={300} />
					<Skeleton height={36} width={140} />
				</Stack>
			</Card>
		);
	}

	if (installation?.installed) {
		const inst = installation.installation;
		return (
			<Card>
				<Stack gap="md">
					<Group justify="space-between">
						<Group gap="sm">
							<IconBrandGithub size={20} />
							<Text fw={500}>GitHub App</Text>
						</Group>
						<Badge color="green" variant="light" leftSection={<IconCheck size={12} />}>
							Connected
						</Badge>
					</Group>

					<Divider />

					<Group gap="md">
						<Avatar src={inst.account.avatar_url} radius="xl" size="md" />
						<Stack gap={2}>
							<Text size="sm" fw={500}>
								{inst.account.login}
							</Text>
							<Text size="xs" c="dimmed">
								{inst.target_type} &middot;{" "}
								{inst.repository_selection === "all"
									? "All repositories"
									: "Selected repositories"}
							</Text>
						</Stack>
					</Group>

					<Group gap="sm">
						<Button
							component="a"
							href={inst.html_url}
							target="_blank"
							rel="noopener noreferrer"
							variant="light"
							size="xs"
							leftSection={<IconExternalLink size={14} />}
						>
							Manage on GitHub
						</Button>
					</Group>
				</Stack>
			</Card>
		);
	}

	return (
		<Card>
			<Stack gap="md">
				<Group gap="sm">
					<IconBrandGithub size={20} />
					<Text fw={500}>GitHub App</Text>
				</Group>

				<Divider />

				<Text size="sm" c="dimmed">
					Install the Mincy GitHub App to enable webhook-triggered pipelines
					and repository access for your projects.
				</Text>

				{installUrl ? (
					<Button
						component="a"
						href={installUrl}
						target="_blank"
						rel="noopener noreferrer"
						leftSection={<IconBrandGithub size={16} />}
						w="fit-content"
					>
						Install GitHub App
					</Button>
				) : (
					<Text size="sm" c="red">
						GitHub App slug is not configured. Set NEXT_PUBLIC_GITHUB_APP_SLUG
						in your environment.
					</Text>
				)}
			</Stack>
		</Card>
	);
}
