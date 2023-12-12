import { Link } from "react-router-dom";
import React, { useCallback } from "react";
import {
    AppBar,
    Box,
    Button,
    Switch,
    Toolbar,
    Typography
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";


type TheNavigationProps = {
    navigate: (route: string) => void;
    setUiMode: (mode: "light" | "dark") => void;
    uiMode: "light" | "dark";
}

/**
 * The navigation bar
 * @param props
 * @constructor
 */
export function TheNavigation(props: TheNavigationProps) {

    const handleUiModeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        props.setUiMode(!event.target.checked ? "light" : "dark");
    }, [props.setUiMode]);

    return (
        <Box >
            <AppBar position="static">
                <Toolbar>
                    <Box mx={2}>
                        <Link to={"/"} style={{ textDecoration: "none", color: "inherit" }}>
                            <Typography variant="h6" color="inherit" component="div">
                                Home
                            </Typography>
                        </Link>
                    </Box>
                    <Box mx={2}>
                        <Button
                            variant={"outlined"}
                            color={props.uiMode === "light" ? "info": "primary"}
                            sx={{
                                color: props.uiMode === "light" ? "white": "primary.main",
                                borderColor: props.uiMode === "light" ? "white": "primary.main",
                                '&:hover': {
                                    backgroundColor: props.uiMode === "light" ? "rgba(255, 255, 255, 0.08)": undefined,
                                    borderColor: props.uiMode === "light" ? "white": "primary.main",
                                }
                            }}
                            onClick={() => props.navigate("/create-room")}
                        >
                            Create Room
                        </Button>
                    </Box>
                    <Box display={"flex"} flexGrow={1} />
                    <Box display={"flex"} alignItems={"center"} minWidth={"100px"}>
                        <LightModeIcon style={{ visibility: props.uiMode === "light" ? "visible": "hidden" }} />
                        <Switch defaultChecked onChange={handleUiModeChange} />
                        <DarkModeIcon style={{ visibility: props.uiMode === "dark" ? "visible": "hidden" }} />
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    )
}