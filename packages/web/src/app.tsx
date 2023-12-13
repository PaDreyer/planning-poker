import React from 'react';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { SnackbarKey, SnackbarProvider, useSnackbar } from "notistack";
import { CssBaseline, IconButton, ThemeProvider, useMediaQuery } from "@mui/material";
import IconClose from "@mui/icons-material/Close";
import { createTheme } from "@mui/material/styles";

import { HomeLayout } from "./layouts/HomeLayout";
import { TheRoomCreation } from "./views/TheRoomCreation";
import { TheRoom } from "./views/Room/TheRoom";
import { TheNotFound } from "./views/TheNotFound";
import { TheHome } from "./views/TheHome";
import { ApplicationErrorBoundary } from "./boundaries/ApplicationErrorBoundary";
import { SocketProvider } from "./provider/socket";
import { ColorModeContext } from "./provider/color-mode";
import { theme } from "./theme/theme";



function SnackbarCloseButton({ snackbarKey }: { snackbarKey: SnackbarKey }) {
    const { closeSnackbar } = useSnackbar();
    return (
        <IconButton onClick={() => closeSnackbar(snackbarKey)}>
            <IconClose />
        </IconButton>
    );
}

export function App() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [colorMode, setColorMode] = React.useState<"light" | "dark">(prefersDarkMode ? "dark" : "light");

    const toggleColorMode = React.useCallback(
        (mode: "light" | "dark") => setColorMode(mode),
        []
    );

    const providerTheme = React.useMemo(
        () => createTheme({ ...theme, palette: { ...theme.palette, mode: colorMode } }),
        [colorMode]
    );

    return (
        <ColorModeContext.Provider value={toggleColorMode}>
            <ThemeProvider theme={providerTheme}>
                <SocketProvider url={"/"} options={{ transports: ["websocket"] }}>
                    <SnackbarProvider
                        action={(key) => <SnackbarCloseButton snackbarKey={key} />}
                        autoHideDuration={5000}
                    >
                        <BrowserRouter>
                            <CssBaseline />
                            <Routes>
                                <Route
                                    path="/"
                                    element={<HomeLayout />}
                                    errorElement={<ApplicationErrorBoundary />}
                                >
                                    <Route
                                        path={"/"}
                                        element={<TheHome />}
                                    />
                                    <Route
                                        path={"create-room"}
                                        element={<TheRoomCreation />}
                                    />
                                    <Route
                                        path={"rooms/:roomId"}
                                        element={<TheRoom />}
                                    />
                                    <Route
                                        path={"*"}
                                        element={<TheNotFound />}
                                    />
                                </Route>
                                <Route
                                    path={"*"}
                                    element={<TheNotFound />}
                                />
                            </Routes>
                        </BrowserRouter>
                    </SnackbarProvider>
                </SocketProvider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    )
}