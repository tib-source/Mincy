import { createClient } from "@/utils/supabase/server";
import { Container, Title, Input, Group, Button, Flex, Paper, Text, Badge, Card, Stack } from "@mantine/core";
import { IconEdit, IconPencil, IconPlus, IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default async function ProjectsPage() {

    const supabase = await createClient()
    
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) return []

    const { data } = await supabase.from("Projects").select("*")



  return (
    <>

        <Group justify="space-between" styles={{
            root: {
                marginTop: "1rem",
                marginBottom: "1rem"
            }
        }}>
            <Title order={2}>
            Projects
            </Title>
            <Button>
                <IconPlus/>
                New Project
            </Button>
        </Group>

        <Group grow>
            <Input placeholder="Find Projects..." leftSection={<IconSearch size={16} />} />
        </Group>

        { data?.map((project, index) => {

        return <Flex mt={20} key={index}> 
            <Card w={250} h={200}>
                <Stack h="inherit" justify="space-between" >
                    <Group justify="space-between">
                        <Title order={3}>{project.name}</Title>
                        <Badge color="blue"> building </Badge>
                    </Group>
                    <Text>{project.description}</Text>
                    <Flex gap={5} w="100%">
                    <Button flex={6}>View Runs</Button>
                    <Button>
                        <Link href={`/projects/${project.id}/edit`}>
                            <IconPencil stroke={1} />
                        </Link>
                    </Button>
                    </Flex>
                </Stack>
            </Card>

        </Flex>


        })}
    </>
  );
}