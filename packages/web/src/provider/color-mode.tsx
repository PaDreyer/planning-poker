import React from "react";

export type ToggleColorModeHandler = (mode: "light" | "dark") => void;

export const ColorModeContext = React.createContext<ToggleColorModeHandler>( () => {});

export function useColorModeHandle(): ToggleColorModeHandler {
    return React.useContext(ColorModeContext);
}