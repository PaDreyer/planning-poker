import React, { useCallback, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Tooltip,
    Typography,
    Card
} from "@mui/material";
import HelpIcon from "@mui/icons-material/Help";
import { enqueueSnackbar } from "notistack";

import { useSocketContext } from "../hooks/useSocketContext";
import { generateRandomString } from "../utils/generate-random-string";


/**
 * Create a room
 *
 * Later with more options
 * @constructor
 */
export function TheRoomCreation() {
    const navigate = useNavigate();
    const socketContext = useSocketContext();
    const [errors, setErrors] = useState<{
        roomName: undefined | string;
        possiblePriorities: undefined | string;
        possibleWeights: undefined | string;
    }>({
        roomName: undefined,
        possiblePriorities: undefined,
        possibleWeights: undefined,
    });

    const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let error = false;
        const roomId = generateRandomString();
        const form = new FormData(event.currentTarget);
        const name = form.get("room-name") as string;
        const possiblePrioritiesRaw = form.get("possiblePriorities") as string;
        const possibleWeightsRaw = form.get("possibleWeights") as string;

        if (!name || name.length === 0) {
            error = true;
            setErrors(err => ({
                ...err,
                roomName: "Room name is required",
            }));
        } else {
            setErrors(err => ({
                ...err,
                roomName: undefined,
            }));
        }

        const possiblePriorities = possiblePrioritiesRaw
            .split(",")
            .map(str => str.trim())
            .filter(str => str.length > 0)
            .map(str => parseInt(str));

        if (possiblePriorities.some(num => isNaN(num))) {
            error = true;
            setErrors(err => ({
                ...err,
                possiblePriorities: "Possible priorities must be numbers seperated by commas",
            }));
        } else {
            setErrors(err => ({
                ...err,
                possiblePriorities: undefined,
            }));
        }

        const possibleWeights = possibleWeightsRaw
            .split(",")
            .map(str => str.trim())
            .filter(str => str.length > 0)
            .map(str => parseInt(str))

        if (possibleWeights.some(num => isNaN(num))) {
            error = true;
            setErrors(err => ({
                ...err,
                possibleWeights: "Possible weights must be numbers seperated by commas",
            }));
        } else {
            setErrors(err => ({
                ...err,
                possibleWeights: undefined,
            }));
        }

        if(error) {
            return;
        }

        await socketContext.api!
            .createRoom({
                roomId,
                name,
                possiblePriorities: possiblePriorities.length > 0 ? possiblePriorities : undefined,
                possibleWeights: possibleWeights.length > 0 ? possibleWeights : undefined,
            })
            .then(message => {
                navigate(`/rooms/${roomId}`)
            })
            .catch(error => enqueueSnackbar(error.message, { variant: "error" }));
    }, [socketContext, navigate])

    return (
        <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
        >
            <Card
                sx={{
                    "display": "flex",
                    "mt": 8,
                    "p": 5,
                    "mb": 10,
                }}
            >
                <Box
                    component="form"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                    onSubmit={handleSubmit}
                >
                    <Typography variant={"h3"} fontWeight={600} mb={5}>
                        Configuration
                    </Typography>

                    <Box
                        mb={3}
                    >
                        <TextField
                            name="room-name"
                            placeholder="Name of room"
                            sx={{
                                width: "300px",
                                maxWidth: "300px",
                            }}
                            error={!!errors.roomName}
                            helperText={errors.roomName}
                        />
                    </Box>


                    <Box
                        display={"flex"}
                        flexDirection={"row"}
                        alignItems={"center"}
                        mb={3}
                        ml={4.5}
                    >
                        <TextField
                            name="possiblePriorities"
                            placeholder="Possible priorities"
                            sx={{
                                width: "300px",
                                maxWidth: "300px",
                            }}
                            error={!!errors.possiblePriorities}
                            helperText={errors.possiblePriorities}
                        />
                        <Box display={"flex"} alignItems={"center"} ml={1.5}>
                            <Tooltip title="Possible priorites separated by comma">
                                <HelpIcon />
                            </Tooltip>
                        </Box>
                    </Box>

                    <Box
                        display={"flex"}
                        flexDirection={"row"}
                        alignItems={"center"}
                        mb={9}
                        ml={4.5}
                    >
                        <TextField
                            name="possibleWeights"
                            placeholder="Possible weights"
                            sx={{
                                width: "300px",
                                maxWidth: "300px",
                            }}
                            error={!!errors.possibleWeights}
                            helperText={errors.possibleWeights}
                        />
                        <Box display={"flex"} alignItems={"center"} ml={1.5}>
                            <Tooltip title="Possible weights separated by comma">
                                <HelpIcon />
                            </Tooltip>
                        </Box>
                    </Box>

                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            width: "100%",
                            maxWidth: "300px",
                            marginBottom: 5,
                        }}
                    >
                        Create room
                    </Button>
                </Box>
            </Card>
        </Box>
    );
}