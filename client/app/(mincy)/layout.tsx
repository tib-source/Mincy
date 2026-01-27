"use client";
import '@mantine/core/styles.css';

import { AppShell, ColorSchemeScript, darken, Group, mantineHtmlProps, MantineProvider, NavLink, ScrollArea, Space, Stack, Text, Title } from "@mantine/core";
import { theme } from "@/theme";
import { IconFolder, IconLayoutDashboard, IconSettings } from '@tabler/icons-react';
import { HeaderContent, HeaderContext } from '@/src/context/HeaderContext';
import { useState } from 'react';
import { AppCrumbs } from '@/src/components/AppCrumbs';
import { NavbarSimple } from '@/src/components/Navbar/Navbar';
import { useNavBarState } from '@/src/store/store';
import { Notifications } from '@mantine/notifications';
import { Provider } from '@xyflow/react/dist/esm/contexts/NodeIdContext';
import { Providers } from '@/src/providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [headerContent, setHeaderContent] = useState<HeaderContent>({})
  const { navbarWidth, headerHeight, docked } = useNavBarState()


  const defaultHeader = {
    left: <AppCrumbs crumbs={[
      { title: "Projects", href: "/projects"},
      { title: "Maker", href: "/projects/1"}
    ]}  />,
  }

  const mergedHeader = {
    ...defaultHeader,
    ...headerContent,
  };

  const nav = [{
    label: "Dashboard",
    link: "/",
    icon: IconLayoutDashboard,
  },
{
    label: "Projects",
    link: "/projects",
    icon: IconFolder,
  },
  {
    label: "Settings",
      link: "/settings",
      icon: IconSettings,
    },

]

  return (
          <HeaderContext.Provider value={{ setHeader: setHeaderContent}} >
          <AppShell
            navbar={{ width: navbarWidth, breakpoint: 'sm', collapsed:{
                desktop: docked
            } }}
            header={{ height: headerHeight }}
              styles={{
            main: {
              height: `calc(100dvh - ${headerHeight}px)`,
            },
          }}
          >
            <AppShell.Header>
              <Group >
                <Group w={navbarWidth} h={headerHeight} justify="center" align="center">
                  <Title ta="center" fw={100} order={1} w="100%" style={{
                    borderRight: "1px solid var(--mantine-color-default-border)" 
                  }}>
                      <Text inherit variant="gradient" component="span" gradient={{ from: 'pink', to: 'yellow' }}>
                        Mincy
                      </Text>
                  </Title>
                </Group>
                <Group justify='space-between' px="md" h="100%" flex={1} >
                  <Group>{mergedHeader.left}</Group>
                  <Group>{mergedHeader.center}</Group>
                  <Group>{mergedHeader.right}</Group>
                </Group>
              </Group>
            </AppShell.Header>

          <AppShell.Navbar w={navbarWidth} p="xs">
              <NavbarSimple data={nav} />
          </AppShell.Navbar>

          
            <AppShell.Main>
                {children}
            </AppShell.Main>
          </AppShell>
          </HeaderContext.Provider>
  );
}
