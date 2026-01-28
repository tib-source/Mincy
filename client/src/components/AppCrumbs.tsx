import { Anchor, Breadcrumbs } from "@mantine/core";

export type Crumb = {
	title: string;
	href: string;
};

export function AppCrumbs({ crumbs }: { crumbs: Crumb[] }) {
	const items = crumbs.map((item, index) => (
		<Anchor href={item.href} key={index}>
			{item.title}
		</Anchor>
	));

	return <Breadcrumbs>{items}</Breadcrumbs>;
}
