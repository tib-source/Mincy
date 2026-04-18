"use client";

import { Container, Stack, Text, Title } from "@mantine/core";
import { AuditCard } from "@/src/components/AuditCard/AuditCard";

export default function AuditPage() {
	return (
		<Container size="sm" py="xl">
			<Stack gap="xl">
				<Stack gap="xs">
					<Title order={2}>Activity Log</Title>
					<Text c="dimmed" size="sm">
						A history of actions performed across your projects.
					</Text>
				</Stack>

				<AuditCard />
			</Stack>
		</Container>
	);
}
