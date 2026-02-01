import { Anchor, Breadcrumbs } from "@mantine/core";

export type Crumb = {
	title: string;
	href: string;
};

export function AppCrumbs({ crumbs }: { crumbs: Crumb[] }) {
	const items = crumbs.map((item) => (
		<Anchor
			href={item.href}
			key={item.href}
			tt={"none"}
			c={"var(--mantine-primary-color-light-color)"}
		>
			{item.title}
		</Anchor>
	));

	return <Breadcrumbs>{items}</Breadcrumbs>;
}
