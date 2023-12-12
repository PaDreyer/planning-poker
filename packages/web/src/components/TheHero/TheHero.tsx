import { Box, Button, Typography } from "@mui/material";
import WebSearchImage from "./search-on-web.svg";

export type TheHeroProps = {
    title: string;
    subTitle: string;
    route: (route: string) => void;
}

export function TheHero(props: TheHeroProps) {
    return (
        <Box display={"flex"} flexDirection={"column"} alignItems={"center"} mt={5} mb={3}>
            <Typography variant={"h1"} mb={3} fontWeight={900}>
                { props.title }
            </Typography>
            <Typography variant={"h5"} fontWeight={600}>
                { props.subTitle }
            </Typography>
            <img
                style={{
                    marginTop: "-50px",
                    zIndex: -1,
                    width: "600px",
                    height: "500px",
                }}
                alt={"search-web-illustration"}
                src={WebSearchImage}
            />
            <Box display={"flex"} justifyContent={"center"} mt={-10}>
                <Box display="flex" width={"15em"}>
                    <Button fullWidth variant={"contained"} onClick={() => props.route("/create-room")}>Start now</Button>
                </Box>
            </Box>
        </Box>
    )
}