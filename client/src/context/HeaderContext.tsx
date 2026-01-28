import { createContext } from "react";

export type HeaderContent = {
	left?: React.ReactNode;
	center?: React.ReactNode;
	right?: React.ReactNode;
};

export const HeaderContext = createContext<{
	setHeader: (content: HeaderContent) => void;
}>({
	setHeader: () => {},
});
