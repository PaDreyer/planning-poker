import { Box, Button, Typography } from "@mui/material";


type AdminPanelProps = {
    onReveal: () => void;
    onReset: () => void;
};

/**
 * Admin panel to control the room
 * @param props
 * @constructor
 */
export function AdminPanel(props: AdminPanelProps) {
    return (
        <Box
          display={"flex"}
          flexDirection={"column"}
          mt={8}
          mx={3}
          mb={5}
        >
            <Typography variant={"h4"} fontWeight={600} pb={2}>
                Controls
            </Typography>
            <Box
                display={"flex"}
                flexDirection={"row"}
                width={"100%"}
                justifyContent={"flex-start"}
            >
                <Button
                    sx={{ mx: 2 }}
                    variant={"contained"}
                    onClick={props.onReveal}
                >
                    Reveal cards
                </Button>
                <Button
                    sx={{ mx: 2 }}
                    variant={"contained"}
                    onClick={props.onReset}
                >
                    Reset vote
                </Button>
            </Box>
        </Box>
    )
}