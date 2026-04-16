"use client";

import {
	Avatar,
	Button,
	Card,
	Divider,
	Group,
	Skeleton,
	Stack,
	Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBrandGithub, IconLogout } from "@tabler/icons-react";
import { useState } from "react";
import { useGithubProfile } from "@/src/hooks/github/useGithubProfile";
import { createClient } from "@/utils/supabase/client";

export function AccountCard() {
	const { data: profile, isLoading } = useGithubProfile();
	const [isSigningOut, setIsSigningOut] = useState(false);

	async function handleSignOut() {
		setIsSigningOut(true);
		const supabase = await createClient();
		const { error } = await supabase.auth.signOut();
		if (error) {
			setIsSigningOut(false);
			notifications.show({ message: error.message, color: "red" });
			return;
		}
		window.location.href = "/login";
	}

	return (
		<Card>
			<Stack gap="md">
				<Group gap="sm">
					<IconBrandGithub size={20} />
					<Text fw={500}>Account</Text>
				</Group>

				<Divider />

				{isLoading ? (
					<Group gap="md">
						<Skeleton circle height={40} />
						<Stack gap={4}>
							<Skeleton height={14} width={120} />
							<Skeleton height={12} width={80} />
						</Stack>
					</Group>
				) : profile ? (
					<Group gap="md">
						<Avatar src={profile.avatar_url} radius="xl" size="md" />
						<Stack gap={2}>
							<Text size="sm" fw={500}>
								{profile.name || profile.login}
							</Text>
							<Text size="xs" c="dimmed">
								@{profile.login}
							</Text>
						</Stack>
					</Group>
				) : null}

				<Button
					variant="light"
					color="red"
					leftSection={<IconLogout size={16} />}
					onClick={handleSignOut}
					loading={isSigningOut}
					w="fit-content"
				>
					Sign out
				</Button>
			</Stack>
		</Card>
	);
}
