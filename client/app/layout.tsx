"use client";
import '@mantine/core/styles.css';

import { AppShell, ColorSchemeScript, Container, createTheme, Divider, Flex, mantineHtmlProps, MantineProvider, NavLink, Stack, Text, Title } from "@mantine/core";
import { theme } from "@/theme";
import { IconFolder, IconLayoutDashboard, IconSettings } from '@tabler/icons-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
          <AppShell
            padding="md"
            navbar={{ width: 250, breakpoint: "sm", collapsed: { mobile: true } }}
          >

            <AppShell.Navbar>

            <Title  ta="center" fw={100} order={1} p={10}>
              <Text inherit variant="gradient" component="span" gradient={{ from: 'pink', to: 'yellow' }}>
                Mincy
              </Text>
            </Title>

              <Divider mb={10}/>

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
              <Container fluid>
                {children}
              </Container>

            </AppShell.Main>
          </AppShell>
        </MantineProvider>
      </body>
    </html>
  );
}
