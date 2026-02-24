import { Avatar, Button, NavLink } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGithubProfile } from "@/src/hooks/github/useGithubProfile";
import { createClient } from "@/utils/supabase/client";
import classes from "./Navbar.module.css";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

export interface NavigationData {
	label: string;
	link: string;
	icon: React.ComponentType<any>;
}

export interface NavProps {
	data: NavigationData[];
}

export function NavbarSimple({ data }: NavProps) {
	const pathname = usePathname();

	const [isRedirecting, setIsRedirecting] = useState(false)
	const { data: profileData, isLoading: profileLoading } = useGithubProfile();

	const links = data.map((item) => (
		<NavLink
			component={Link}
			className={classes.link}
			href={item.link}
			key={item.label}
			label={item.label}
			leftSection={
				<item.icon className={classes.linkIcon} size={16} stroke={1.5} />
			}
			active={pathname === item.link || pathname.startsWith(item.link + "/")}
		/>
	));

	async function signOut() {
		setIsRedirecting(true)
		const supabase = await createClient();
		const { error } = await supabase.auth.signOut()
		if (error){
			setIsRedirecting(false)
			notifications.show({
				message: error.message,
				color: 'red'
			})
		}
		window.location.href = '/login';
	}

	return (
		<nav className={classes.navbar}>
			<div className={classes.navbarMain}>{links}</div>

			<div className={classes.footer}>
				{profileData && (
					<Button
						leftSection={
							<Avatar src={profileData?.avatar_url} radius="xl" size={20} />
						}
						fullWidth
						justify="flex-start"
						variant="transparent"
					>
						{profileData?.name}
					</Button>
				)}

				<Button
					leftSection={<IconLogout stroke={1.5} />}
					fullWidth
					justify="flex-start"
					variant="subtle"
					loading={isRedirecting}
					onClick={() => signOut()}
				>
					Logout
				</Button>
			</div>
		</nav>
	);
}
