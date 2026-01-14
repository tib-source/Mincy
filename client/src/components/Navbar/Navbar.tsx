import { useState } from 'react';
import {
  Icon2fa,
  IconBellRinging,
  IconDatabaseImport,
  IconFingerprint,
  IconKey,
  IconLogout,
  IconMacro,
  IconReceipt2,
  IconSettings,
  IconSwitchHorizontal,
} from '@tabler/icons-react';
import { Code, Group, NavLink } from '@mantine/core';
// import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './Navbar.module.css';
import { INTERNALS } from 'next/dist/server/web/spec-extension/request';
import { usePathname } from 'next/navigation'
import Link from 'next/link';

export interface NavigationData{
    label: string;
    link: string;
    icon: React.ComponentType<any>;
}

export interface NavProps{
    data: NavigationData[]
}


export function NavbarSimple({ data }: NavProps) {
    const pathname = usePathname()

  const links = data.map((item) => (
    <NavLink
      component={Link}
      className={classes.link}
      href={item.link}
      key={item.label}
      label={item.label}
      leftSection={<item.icon className={classes.linkIcon} size={16} stroke={1.5} />}
      active={pathname === item.link || pathname.startsWith(item.link + '/')}
    />
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        {/* <Group className={classes.header} justify="space-between">
          <IconMacro size={28} />
          <Code fw={700}>v3.1.2</Code>
        </Group> */}
        {links}
      </div>

      <div className={classes.footer}>
        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
          <span>Change account</span>
        </a>

        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}