"use client";
import '@mantine/core/styles.css';

import { AppShell, ColorSchemeScript, Group, mantineHtmlProps, MantineProvider, NavLink, Space, Stack, Text, Title } from "@mantine/core";
import { theme } from "@/theme";
import { IconFolder, IconLayoutDashboard, IconSettings } from '@tabler/icons-react';
import { HeaderContent, HeaderContext } from '@/src/context/HeaderContext';
import { useState } from 'react';
import { AppCrumbs } from '@/src/components/AppCrumbs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [headerContent, setHeaderContent] = useState<HeaderContent>({})
  const navbarWidth = 250
  const headerHeight = 56


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
  return (
      <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <HeaderContext.Provider value={{ setHeader: setHeaderContent}} >
          <AppShell
            padding="md"
            navbar={{ width: navbarWidth, breakpoint: "sm", collapsed: { mobile: true } }}
            header={{ height: headerHeight }}
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


            <AppShell.Navbar>
              <NavLink
                label="Dashboard"
                href='/'
                leftSection={<IconLayoutDashboard stroke={1} />}
                variant="light"
              />
              <NavLink
                label="Projects"
                href='/projects'
                leftSection={<IconFolder stroke={1} />}
                variant="light"
              />
              <NavLink
                label="Settings"
                href='/settings'
                leftSection={<IconSettings stroke={1} />}
                variant="light"
              />
            </AppShell.Navbar>

            <AppShell.Main>
                {children}
            </AppShell.Main>
          </AppShell>
          </HeaderContext.Provider>
        </MantineProvider>
      </body>
    </html>
  );
}
