import { TableSort } from "@/src/components/SortableTable/SortableTable";
import { Anchor, Badge, Breadcrumbs, Button, Container, Flex, Group, Paper, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

export default function ProjectPage() {
  return (
    <Container fluid p="lg">
      <Flex justify="space-between">
        <Stack flex={4}>
          <Title ta="center" fz={50} fw={200} order={1}>
                <Group>
                  <Text inherit >
                    Mincy
                  </Text>
                  <Badge color="green">Passing</Badge>
                </Group>
          </Title>
          <Text>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fugiat natus repellat optio culpa incidunt, deleniti quae ratione sed soluta non ad, recusandae sit, voluptatum voluptate temporibus est magnam beatae suscipit!
          </Text>
        </Stack>

        <Group flex={2} align="flex-start" justify="flex-end" pt="md" gap={5}>
          <Button component={Link} href="/projects/1/edit" variant="light">Edit</Button>
          <Button>Trigger Run</Button>
        </Group>
      </Flex>

      <Group pt="lg">
        <TableSort/>
      </Group>

    </Container>
  );
}