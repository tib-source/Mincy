import { nodeRegistry } from "@/src/nodes/registry";
import { useNavBarState } from "@/src/store/store";
import { Box, Button, Text, ScrollArea, Stack, UnstyledButton, Center, Divider, Flex, Group } from "@mantine/core";
import navClass from "@/src/components/Navbar/Navbar.module.css";
import { Search } from "../SearchInput/Search";
import { useComponentTree } from "@/src/hooks/useComponentTree";
import { IconChevronDown, IconChevronRight, IconGripVertical } from "@tabler/icons-react";
import { useState } from "react";
import classes from "./ComponentList.module.css"
import { ComponentHeader } from "../ComponentHeader/ComponentHeader";
import { Collapsable } from "../Collapsable/Collapsable";

interface ComponentListProps {
  componentList: React.ReactNode[];
}

export function ComponentList() {
  const {
    categories,
    categoryMap
  } = useComponentTree(nodeRegistry)

  const [expandedCategories, setExpandedCategories] = useState(categories)
  const { navbarWidth } = useNavBarState()




  return (
    <ScrollArea
      w={navbarWidth}
      className={navClass.nav}
      style={{
        borderRight: "1px solid var(--mantine-color-default-border)",
        overflowY: "auto",
      }}
    >
      <Box w="100%" p="md">
        <Text c="dimmed" mb="sm">Compoent Library</Text>
        <Search />
      </Box>
      <Divider />
      <Stack p="md" gap="sm">
        {categories.map((category, index) => (
          <Collapsable
          key={category}
          defaultOpen={true}
          iconOpen={<IconChevronDown width={15} />}
          iconClose={ <IconChevronRight width={15} />}
          trigger={<Button
            px={2}
            py={1.5}
            fz="md"
            c="dimmed"
            variant="transparent"
              > {category} </Button>
                }
              >
              <Stack
                key={index}
                gap={10}
                >
                  {categoryMap[category].map((node, index) => (
                      <ComponentHeader
                        node={node}
                        key={node.label}
                        showDescription={true}
                        draggable={true}
                        RightIcon={<IconGripVertical
                          width={15}
                          className={classes.grip}
                          style={{
                          transition: 'opacity 0.2s ease',
                          }}
                      />}
                    />

                  ))
                 }

                </Stack>
          </Collapsable>
        ))}
      </Stack>
    </ScrollArea>
  );
}
