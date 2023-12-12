import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import Lottie from "lottie-react";
import animationData from "../assets/img/Not-Found-Animation.json"

export function TheNotFound() {
    const navigate = useNavigate();

    return (
        <Box display={"flex"} flexDirection={"column"} alignItems={"center"} mt={6} mb={2}>
            <Typography fontSize={96} fontWeight={900} mb={-2}>
                404
            </Typography>
            <Lottie animationData={animationData} style={{ width: "30%" }} />
            <Typography variant={"h4"} fontWeight={600} mb={2} mt={2}>
                Page not found
            </Typography>
            <Button onClick={() => navigate("/")}>
                Please, Bring me back to the camp
            </Button>
        </Box>
    )
}