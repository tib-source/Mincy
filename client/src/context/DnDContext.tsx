import { createContext, type ReactNode, useContext, useState } from "react";

interface DnDContextValue {
	type: string;
	setType: (type: string) => void;
}

export const DnDContext = createContext<DnDContextValue | null>(null);

export const DnDProvider = ({ children }: { children: ReactNode }) => {
	const [type, setType] = useState<string>("");
	return (
		<DnDContext.Provider value={{ type, setType }}>
			{children}
		</DnDContext.Provider>
	);
};

const fallback: DnDContextValue = { type: "", setType: () => {} };

export const useDnD = () => {
	return useContext(DnDContext) ?? fallback;
};
