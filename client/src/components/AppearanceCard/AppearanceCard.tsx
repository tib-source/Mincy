"use client";

import {
	Card,
	Divider,
	Group,
	SegmentedControl,
	Stack,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
import {
	IconMoon,
	IconPalette,
	IconSun,
	IconSunMoon,
} from "@tabler/icons-react";

export function AppearanceCard() {
	const { colorScheme, setColorScheme } = useMantineColorScheme();

	return (
		<Card>
			<Stack gap="md">
				<Group gap="sm">
					<IconPalette size={20} />
					<Text fw={500}>Appearance</Text>
				</Group>

				<Divider />

				<Group justify="space-between">
					<Stack gap={2}>
						<Text size="sm">Theme</Text>
						<Text size="xs" c="dimmed">
							Choose how Mincy looks to you
						</Text>
					</Stack>

					<SegmentedControl
						value={colorScheme}
						onChange={(value) =>
							setColorScheme(value as "light" | "dark" | "auto")
						}
						data={[
							{
								value: "light",
								label: (
									<Group gap={6} wrap="nowrap">
										<IconSun size={14} />
										<Text size="xs">Light</Text>
									</Group>
								),
							},
							{
								value: "dark",
								label: (
									<Group gap={6} wrap="nowrap">
										<IconMoon size={14} />
										<Text size="xs">Dark</Text>
									</Group>
								),
							},
							{
								value: "auto",
								label: (
									<Group gap={6} wrap="nowrap">
										<IconSunMoon size={14} />
										<Text size="xs">System</Text>
									</Group>
								),
							},
						]}
					/>
				</Group>
			</Stack>
		</Card>
	);
}
