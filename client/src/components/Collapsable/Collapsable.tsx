import { Box, Collapse, type CollapseProps } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import type React from "react";
import { cloneElement, type ReactNode } from "react";

export type CollapsableProps = {
	defaultOpen?: boolean;
	iconOpen?: ReactNode;
	iconClose?: ReactNode;
	trigger: React.ReactElement<{
		onClick?: React.MouseEventHandler;
		leftSection?: React.ReactNode;
	}>;
	children?: ReactNode;
	collapseStyle?: Partial<CollapseProps>;
};

export function Collapsable({
	children,
	iconClose,
	defaultOpen = false,
	iconOpen,
	trigger,
	collapseStyle,
}: CollapsableProps) {
	const [opened, { toggle }] = useDisclosure(defaultOpen);
	iconOpen = <IconChevronDown size={12} strokeOpacity={0.5} />;
	iconClose = <IconChevronRight size={12} strokeOpacity={0.5} />;

	const triggerWithProps = cloneElement(trigger, {
		onClick: toggle,
		leftSection: opened ? iconOpen : iconClose,
	});

	return (
		<Box>
			{triggerWithProps}
			<Collapse in={opened} {...collapseStyle}>
				{children}
			</Collapse>
		</Box>
	);
}
