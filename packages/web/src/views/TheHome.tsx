import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";

import { TheHero } from "../components/TheHero/TheHero";


type TheHomeProps = {}

export function TheHome(props: TheHomeProps) {
    const navigate = useNavigate();

    return (
        <Box mb={15}>
            <TheHero
                title={"Planning-Poker"}
                subTitle={"Stop wasting your time looking for the right tool"}
                route={route => navigate(route)}
            />
        </Box>
    );
}