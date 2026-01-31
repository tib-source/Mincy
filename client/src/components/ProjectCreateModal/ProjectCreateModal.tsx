import {
	Autocomplete,
	AutocompleteProps,
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
import { useMemo, useState } from "react";
import { useGithubRepos } from "@/src/hooks/query/useGithubRepos";

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
import { useMutation } from "@tanstack/react-query";

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
	const [selectedRepo, setSelectedRepo] = useState<GithubOptions | null>(null);
	console.log(repos);
	const repoList = useMemo(() => {
		if (Array.isArray(repos)) {
			return repos.map((repo) => ({
				value: repo.name,
				description: repo.description ?? "",
				...repo,
			})) as GithubOptions[];
		}

		return [];
	}, [repos]);

	const { isPending, mutate } = useMutation({
		mutationFn: async (repo: GithubOptions) => {
			const res = await fetch("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: repo.name,
					description: repo.description ?? "",
					org: repo.owner.login,
					provider: "github",
					cloneUrl: repo.git_url,
				}),
			});

			if (!res.ok) throw await res.json();
			return res.json();
		},
	});

	const handleCreate = () => {
		if (!selectedRepo) return;
		mutate(selectedRepo);
	};

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
