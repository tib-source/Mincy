import { nodeRegistry } from "@/src/nodes/registry";
import { useNavBarState } from "@/src/store/store";
import { Box, Button, Text, ScrollArea, Stack, UnstyledButton, Center, Divider } from "@mantine/core";

interface ComponentListProps {
  componentList: React.ReactNode[];
}

export function ComponentList() {
    const { navbarWidth} = useNavBarState()
  return (
    <ScrollArea
      w={ navbarWidth }
      style={{
        borderRight: "1px solid var(--mantine-color-default-border)",
        overflowY: "auto",
      }}
    >
        <Box w="100%" p="md" style={{
            backgroundColor: "var(--mantine-color-default-border)"
        }}>
            <Text c="dimmed">Compoent Library</Text>
        </Box>
        <Divider/>
      <Stack mt="md">
              {nodeRegistry.map((node, index) => {
        return <Button key={index} size="md" leftSection={<node.icon/>} variant="default" justify="flex-start">
            {node.label}
      </Button>
        })}
      </Stack>
    </ScrollArea>
  );
}

