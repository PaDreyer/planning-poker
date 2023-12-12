import { Box, Typography, useTheme } from "@mui/material";

/**
 * The footer
 * @constructor
 */
export function TheFooter() {
    const theme = useTheme();

    return (
        <Box
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"center"}
            pt={3}
            pb={2}
            sx={{
                backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.default : theme.palette.primary.main,
                backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.09))`
            }}
        >
            <Typography>
                Made with a 🖥 by someone
            </Typography>
        </Box>
    )
}