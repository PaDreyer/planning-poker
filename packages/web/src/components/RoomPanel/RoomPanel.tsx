import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import ShareIcon from '@mui/icons-material/Share';

type RoomPanelProps = {
    roomName: string | undefined;
    priority: number | undefined;
    weight: number | undefined;
    revealed: boolean;
}

/**
 * Room panel
 * @param props
 * @constructor
 */
export function RoomPanel(props: RoomPanelProps) {
    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            mt={8}
            mb={3}
        >
            <Typography variant={"h3"} fontWeight={600} pb={2}>
                { props.roomName ?? "Room" }
                <Tooltip placement={"top"} title={"Copy room link to clipboard"}>
                    <IconButton
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href).then(
                                () => enqueueSnackbar("Room link copied to clipboard", {variant: "success"}),
                            )
                        }}
                    >
                        <ShareIcon color={"disabled"} />
                    </IconButton>
                </Tooltip>
            </Typography>
            <Box
                visibility={props.revealed ? "visible" : "hidden"}
                display={"flex"}
                flexDirection={"row"}
                width={"100%"}
                justifyContent={"space-around"}
            >
                <Box
                    display={"flex"}
                    flexDirection={"row"}
                >
                    <Typography variant={"h6"} fontWeight={400} mr={1}>
                        Priority:
                    </Typography>
                    <Typography variant={"h6"} fontWeight={600}>
                        {props.priority ?? "?"}
                    </Typography>
                </Box>
                <Box
                    display={"flex"}
                    flexDirection={"row"}
                >
                    <Typography variant={"h6"} fontWeight={400} mr={1}>
                        Weight:
                    </Typography>
                    <Typography variant={"h6"} fontWeight={600}>
                        {props.weight ?? "?"}
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}
