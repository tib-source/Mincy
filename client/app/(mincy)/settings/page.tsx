"use client";

import { Container, Stack, Text, Title } from "@mantine/core";
import { AccountCard } from "@/src/components/AccountCard/AccountCard";
import { AppearanceCard } from "@/src/components/AppearanceCard/AppearanceCard";
import { GitHubAppCard } from "@/src/components/GitHubAppCard/GitHubAppCard";

export default function Settings() {
	return (
		<Container size="sm" py="xl">
			<Stack gap="xl">
				<Stack gap="xs">
					<Title order={2}>Settings</Title>
					<Text c="dimmed" size="sm">
						Manage your account, integrations, and preferences.
					</Text>
				</Stack>

				<Stack gap="md">
					<AccountCard />
					<GitHubAppCard />
					<AppearanceCard />
				</Stack>
			</Stack>
		</Container>
	);
}
