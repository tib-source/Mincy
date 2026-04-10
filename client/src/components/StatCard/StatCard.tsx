import { Card, Group, Skeleton, Stack, Text, ThemeIcon } from "@mantine/core";
import type { ReactNode } from "react";

interface StatCardProps {
	title: string;
	value: string | number;
	icon: ReactNode;
	color: string;
	isLoading?: boolean;
}

export function StatCard({ title, value, icon, color, isLoading }: StatCardProps) {
	return (
		<Card padding="lg" radius="md" withBorder>
			<Group justify="space-between" align="flex-start">
				<Stack gap={4}>
					<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
						{title}
					</Text>
					{isLoading ? (
						<Skeleton height={32} width={60} />
					) : (
						<Text size="xl" fw={700}>
							{value}
						</Text>
					)}
				</Stack>
				<ThemeIcon size={42} variant="light" color={color} radius="md">
					{icon}
				</ThemeIcon>
			</Group>
		</Card>
	);
}
