import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import {Theme} from "@mui/material/styles";


type AdminPanelProps = {
    onReveal: () => void;
    onReset: () => void;
};

/**
 * Admin panel to control the room
 * @param props AdminPanelProps
 */
export function AdminPanel(props: AdminPanelProps) {
    const buttonFullWith = useMediaQuery<Theme>(t => t.breakpoints.down("sm"));

    return (
        <Box
          display={"flex"}
          flexDirection={"column"}
          sx={{ px: 1, mb: 3, mt: 2 }}
        >
            <Typography
                variant={"h4"}
                fontWeight={600}
                sx={{
                    mx: {
                        xs: 1,
                        sm: 0,
                    },
                    my: 2,
                    alignSelf: "flex-start",
                }}
            >
                Controls
            </Typography>
            <Box
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"flex-start"}
                mt={1.5}
            >
                <Button
                    fullWidth={buttonFullWith}
                    sx={{ mr: 1}}
                    variant={"contained"}
                    onClick={props.onReveal}
                >
                    Reveal cards
                </Button>
                <Button
                    fullWidth={buttonFullWith}
                    variant={"contained"}
                    onClick={props.onReset}
                >
                    Reset vote
                </Button>
            </Box>
        </Box>
    )
}