"use client";

import { useState, useCallback, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, ColorMode, NodeChange, EdgeChange, Connection, Node, Edge, Background, Controls, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ActionIcon, Anchor, Box, Button, ButtonGroup, Flex, Group, MantineColorScheme,NavLink,Text, useMantineColorScheme } from '@mantine/core';
import { GitCheckoutNode } from '@/src/nodes/GitCheckoutNode';
import { TriggerNode } from '@/src/nodes/TriggerNode';
import { ComponentList } from '@/src/components/ComponentList/ComponentList';
import { nodeRegistry } from '@/src/nodes/registry';
import { HeaderContent } from '@/src/context/HeaderContext';
import { IconArrowBackUp, IconArrowLeft, IconChevronLeft, IconDeviceFloppy, IconHome2, IconPencil, IconSquareRoundedCheck } from '@tabler/icons-react';
import { useHeader } from '@/src/hooks/useHeader';
import { useNavBarState } from '@/src/store/store';
import Link from 'next/link';
import { FlowCanvas } from '@/src/components/Canvas/FlowCanvas';



export default function ProjectEditPage() {
    const projectData = {
      name: "Maker",
      link: "/projects/1"
    }
    const projectEditHeader : HeaderContent = {
      left: <Group>
        <ActionIcon variant="subtle" aria-label="Settings" href={projectData.link} component={Link}>
          <IconChevronLeft stroke={1.5} />
        </ActionIcon>
        <Flex align="center">
          <Text fz="h3">
            {projectData.name}
          </Text>
          <ActionIcon variant="transparent" color="gray" aria-label="Settings">
            <IconPencil style={{ width: '70%', height: '70%' }} stroke={1.5} />
          </ActionIcon>
        </Flex>
      </Group>,
      right: <Group  justify="center">
      <Button leftSection={<IconArrowBackUp size={14} />} variant="default">
        Undo
      </Button>

      <Button variant="default" leftSection={<IconSquareRoundedCheck size={14} />}>Validate</Button>

      <Button
        leftSection={<IconDeviceFloppy size={14} />}
      >
        Save Changes
      </Button>
      </Group>
    }

    useHeader(projectEditHeader)



    const { setDocked } = useNavBarState()

    useEffect(()=>{
      setDocked(true)

      return ()=> setDocked(false)
    }, [])



  return (
    <Flex
      h="100%"
    >
      <ComponentList />
      <FlowCanvas />
    </Flex>
  );
}