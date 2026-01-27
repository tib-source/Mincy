import {
  IconLogout,
} from '@tabler/icons-react';
import { Avatar, NavLink } from '@mantine/core';
// import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './Navbar.module.css';
import { usePathname } from 'next/navigation'
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useGithubProfile } from '@/src/hooks/useGithubProfile';

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

    const { data : profileData, isLoading: profileLoading} = useGithubProfile()

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

  

  async function signOut() {
    const supabase = await createClient();
    supabase.auth.signOut()
    
  }

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
          { profileLoading == false ? (
                    <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
                      <Avatar
                        src={profileData.avatar_url}
                        radius="xl"
                        size={24}
                        mr="sm"
                      />
                    <span>{profileData?.name}</span>
                  </a>
          ) : <></>}

        <a href="#" className={classes.link} onClick={() => signOut() }>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}