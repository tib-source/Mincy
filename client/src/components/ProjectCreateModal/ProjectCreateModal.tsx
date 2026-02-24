"use client";

import {
	Autocomplete,
	Avatar,
	Button,
	type ComboboxStringItem,
	Group,
	Modal,
	type ModalProps,
	Tabs,
	Text,
} from "@mantine/core";
import {
	IconBrandBitbucketFilled,
	IconBrandGithubFilled,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { notifications, showNotification } from "@mantine/notifications";
import { useGithubRepos } from "@/src/hooks/github/useGithubRepos";

interface GithubOptions extends ComboboxStringItem {
	image: string;
	description: string;
	name: string;
	org: string;
	owner: {
		login: string;
	};
	git_url: string;
	html_url: string;
}

import type { RenderAutocompleteOption } from "@mantine/core";
import type { GitHubRepo } from "@/src/client/gitClient";
import { useCreateProject } from "@/src/hooks/projects/useCreateProject";

const renderAutocompleteOption: RenderAutocompleteOption = ({ option }) => {
	const githubOption = option as GithubOptions;

	return (
		<Group gap="sm">
			<Avatar src={githubOption.image} size={36} radius="xl" />
			<div>
				<Text size="sm">{githubOption.value}</Text>
				<Text size="xs" opacity={0.5}>
					{githubOption.description}
				</Text>
			</div>
		</Group>
	);
};

export function ProjectCreateModal(props: ModalProps) {
	const { data: repos, isLoading } = useGithubRepos();
	const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
	const repoList = useMemo(() => {
		if (Array.isArray(repos)) {
			return repos.map((repo) => ({
				value: repo.name,
				...repo,
			}));
		}

		return [];
	}, [repos]);

	const { mutate, isPending, isSuccess, error } = useCreateProject();

	const handleCreate = () => {
		if (!selectedRepo) return;
		mutate(selectedRepo);
	};

	useEffect(() => {
		if (isSuccess) {
			props.onClose();
			notifications.show({
				title: "Project Created",
				message: `${selectedRepo?.full_name} has been created`,
				color: "green"
			})
		}
	}, [isSuccess]);

	useEffect(() => {
		if (error) {
			const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
			notifications.show({
				title: "Error creating project",
				message: errorMessage,
				color: "red",
				autoClose: 5000,
			});
		}
	}, [error]);


	return (
		<Modal {...props}>
			<Tabs variant="outline" defaultValue="github">
				<Tabs.List>
					<Tabs.Tab
						value="github"
						leftSection={<IconBrandGithubFilled size={12} />}
					>
						Github
					</Tabs.Tab>
					<Tabs.Tab
						value="bitbucket"
						leftSection={<IconBrandBitbucketFilled size={12} />}
						disabled
					>
						BitBucket
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="github" p={"md"}>
					<Autocomplete
						data={repoList}
						error={error?.message}
						onChange={(val) => {
							const repo = repoList.find((r) => r.value === val) ?? null;
							setSelectedRepo(repo);
						}}
						renderOption={renderAutocompleteOption}
						maxDropdownHeight={300}
						label="Select a repository"
						placeholder="Search for repo"
					/>

					<Button
						mt="md"
						fullWidth
						loading={isPending}
						disabled={!selectedRepo}
						onClick={handleCreate}
					>
						Create Project
					</Button>
				</Tabs.Panel>

				<Tabs.Panel value="messages">Messages tab content</Tabs.Panel>
			</Tabs>
		</Modal>
	);
}
