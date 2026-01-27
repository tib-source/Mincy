import { createClient } from "@/utils/supabase/server";
import { Container, Title, Input, Group, Button, Flex, Text, Badge, Card, Stack } from "@mantine/core";
import { IconEdit, IconPencil, IconPlus, IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default async function ProjectsPage() {

    const supabase = await createClient()
    
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) return []

    const { data } = await supabase.from("Projects").select("*")



  return (
    <Container fluid>
        <Group justify="space-between" styles={{
            root: {
                marginTop: "1rem",
                marginBottom: "1rem"
            }
        }}>

            <div>
                <Title order={1}>
                    Projects
                </Title>
                <Text>Manage and monitor your CI/CD pipelines.</Text>
            </div>
            <Button>
            <IconPlus/>
                New Project
            </Button>
        </Group>

        { data?.map((project, index) => {

        return <Flex mt={10} key={index}> 
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>{project.name}</Text>
                    <Badge color="green">Passing</Badge>
                </Group>

                <Text size="sm" c="dimmed">
                    {project.description}
                </Text>
                
                <Flex>
                    <Button color="blue" fullWidth mt="md" radius="md">
                        View Runs
                    </Button>
                    <Link href={`/projects/${project.id}/edit`}>
                        <IconPencil stroke={1} />
                    </Link>
                </Flex>
            </Card>
        </Flex>


        })}
    </Container>
  );
}