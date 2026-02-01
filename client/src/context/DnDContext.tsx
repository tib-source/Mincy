import {
	Children,
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useContext,
	useState,
} from "react";

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

export const useDnD = () => {
	const context = useContext(DnDContext);
	if (!context) {
		throw new Error("useDnD must be used within a DnDProvider");
	}
	return context;
};
