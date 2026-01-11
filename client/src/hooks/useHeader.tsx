import { useContext, useEffect } from "react";
import { HeaderContent, HeaderContext } from "../context/HeaderContext";

export function useHeader( content: HeaderContent){
    const { setHeader } = useContext(HeaderContext)

    useEffect(()=> {
        setHeader(content);
        return ()=> setHeader({});
    }, [])
}