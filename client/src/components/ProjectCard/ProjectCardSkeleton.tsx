import { Card, Stack, Group, Box, Skeleton, Divider } from "@mantine/core";

export function ProjectCardSkeleton() {
  const statusColorMapping = {
    passing: "green",
    failing: "red",
    running: "orange",
  };

  return (
    <Card padding="md" radius="md" withBorder>
      <Stack gap="md" p="sm">
        <Group justify="space-between">
          <Box>
            <Skeleton height={24} width={120} radius="sm" /> 
            <Group gap={5} pt={3}>
              <Skeleton height={15} width={80} radius="sm" />
            </Group>
          </Box>
          <Skeleton height={24} width={60} radius="sm" /> 
        </Group>

        <Skeleton height={16} width="100%" radius="sm" /> 

        <Divider opacity={0.25} />

        <Group justify="space-between">
          <Group>
            <Skeleton circle height={24} width={24} />
            <Skeleton height={14} width={50} radius="sm" />
          </Group>
          <Skeleton height={24} width={50} radius="sm" />
        </Group>
      </Stack>
    </Card>
  );
}
