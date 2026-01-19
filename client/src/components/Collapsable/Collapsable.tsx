import { TriggerType } from "@/src/nodes/TriggerNode";
import { Box, Group, Button, Collapse, Text, ButtonProps, ButtonFactory, CollapseProps } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { triggerAsyncId } from "async_hooks";
import React, { cloneElement, ReactElement, ReactNode } from "react";


export type CollapsableProps = {
    defaultOpen?: boolean,
    iconOpen?: ReactNode,
    iconClose?: ReactNode,
    trigger: React.ReactElement<{
        onClick?: React.MouseEventHandler,
        leftSection?: React.ReactNode
    }>;
    children?: ReactNode
    collapseStyle?: Partial<CollapseProps>
}



export function Collapsable({children, iconClose, defaultOpen = false, iconOpen, trigger, collapseStyle} : CollapsableProps){

    const [opened, { toggle }] = useDisclosure(defaultOpen);
    iconOpen = <IconChevronDown size={12} strokeOpacity={0.5}/>
    iconClose = <IconChevronRight size={12} strokeOpacity={0.5}/>

    const triggerWithProps = cloneElement(trigger, {
        onClick: toggle,
        leftSection: opened ? iconOpen : iconClose
    })

    return <Box >
        {triggerWithProps}
        <Collapse in={opened} {...collapseStyle}>
          {children}
        </Collapse>
    </Box>
}


{/* <div key={category}>
            <Button
            px={2}
            py={1.5}
            fz="md"
            c="dimmed"
            variant="transparent"
            onClick={() => toggleCategories(category)} 
            leftSection={expandedCategories.includes(category) ? (
                <IconChevronDown width={15} />
              ) : (
                <IconChevronRight width={15} />
              )}> {category}</Button>

            
            {
              expandedCategories.includes(category) && (
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

                </Stack> )
            }
          </div> */}