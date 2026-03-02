"use client";
import { Button, Flex, Group, Paper, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBrandBitbucket, IconBrandGithub } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

export default function AuthenticationForm() {
	const [isRedirecting, setIsRedirecting] = useState(false);
	async function signInWithGithub() {
		setIsRedirecting(true);
		const supabase = await createClient();

		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "github",
			options: {
				scopes: "read:user",
				redirectTo: `${window.location.origin}/api/auth/oauth`,
			},
		});

		if (error) {
            setIsRedirecting(false);
            notifications.show({ message: error.message, color: 'red' });
        }
	}


	return (
		<Flex
			w="100vw"
			h="100vh"
			justify={"center"}
			align={"center"}
			direction={"column"}
			gap="lg"
		>
			<Text fz={40} fw={500} c="bright">
				Welcome to Mincy {/* TODO: make this bit look more fancy */}
			</Text>
			<Paper radius="md" p="md" withBorder>
				<Group>
					<Button
						onClick={() => signInWithGithub()}
						leftSection={<IconBrandGithub />}
						variant="default"
						loading={isRedirecting}
						radius="xl"
					>
						{" "}
						GitHub{" "}
					</Button>
					<Button
						leftSection={<IconBrandBitbucket />}
						disabled
						variant="default"
						radius="xl"
					>
						{" "}
						Bitbucket{" "}
					</Button>
				</Group>
			</Paper>
		</Flex>
	);
}
