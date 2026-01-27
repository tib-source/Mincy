"use client";
import { createClient } from '@/utils/supabase/client';
import {
    Box,
    Button,
    Flex,
    Group,
    Paper,
    Text,
  } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBrandBitbucket, IconBrandGithub } from '@tabler/icons-react';
import { useState } from 'react';
  
export default function AuthenticationForm() {

    


    async function signInWithGithub() {
        const supabase = await createClient()

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
                redirectTo: `${window.location.origin}/api/auth/oauth?next=/`,
             },
        })
        
        if (error?.message){
            notifications.show({
                position: "bottom-right",
                message: error.message,
                autoClose: true
            })
        }

    }


return (
<Flex w="100vw" h="100vh" justify={'center'} align={'center'} direction={"column"} gap="lg">
        <Text fz={40} fw={500} c="bright">
            Welcome to Mincy { /* TODO: make this bit look more fancy */}
        </Text>
        <Paper radius="md" p="md" withBorder >

            <Group >
                <Button onClick={()=>signInWithGithub()} leftSection={<IconBrandGithub />} variant="default" radius="xl"> GitHub </Button>
                <Button leftSection={<IconBrandBitbucket />} disabled variant="default" radius="xl"> Bitbucket </Button>
            </Group>
        </Paper>
    </Flex>
);
}