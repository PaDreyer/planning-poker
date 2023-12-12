import { Outlet, useNavigate } from "react-router-dom";
import React from "react";
import {Box, useTheme} from "@mui/material";

import { TheNavigation } from "../components/TheNavigation/TheNavigation";
import { TheFooter } from "../components/TheFooter/TheFooter";
import { useColorModeHandle } from "../provider/color-mode";

/**
 * The layout for the home page
 * @constructor
 */
export function HomeLayout() {
    const navigate = useNavigate();
    const theme = useTheme();
    const setColorMode = useColorModeHandle();

    return (
        <Box display={"flex"} flexDirection={"column"} width={"100%"}>
            <TheNavigation
                navigate={route => navigate(route)}
                setUiMode={setColorMode}
                uiMode={theme.palette.mode}
            />
            <main style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
                <Outlet />
            </main>
            <TheFooter />
        </Box>
    )
}