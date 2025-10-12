'use client'

import { AppShell, Button, ButtonGroup, Flex } from '@mantine/core';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '../components/Welcome/Welcome';

export default function HomePage() {
  return (
      <>
      <Welcome />
      <ColorSchemeToggle />
      </>
  );
}
