import type {Socket} from "socket.io-client";
import type { FormEvent } from "react";
import { useState } from "react";
import {
    Box,
    Button,
    Card,
    Checkbox,
    FormControlLabel,
    TextField,
    Typography
} from "@mui/material";


export type TheRoomInitializationProps = {
    roomId: string;
    socket: Socket;
    setName: (name: string) => void;
}

/**
 * Ask for player name
 * @param props TheRoomInitializationProps
 */
export function TheRoomInitialization(props: TheRoomInitializationProps) {
    const [errors, setErrors] = useState<{
        playerName: undefined | string;
    }>({
        playerName: undefined,
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const formData = Object.fromEntries(form);
        const playerName = formData["player-name"] as string;
        const rememberPlayerName = formData["remember-player-name"] as string;

        if (!playerName || playerName.length === 0) {
            setErrors(err => ({
                ...err,
                playerName: "Player name is required",
            }));
            return;
        }

        if (rememberPlayerName) {
            localStorage.setItem("player-name", playerName);
        }

        setErrors(err => ({
            ...err,
            playerName: undefined,
        }));
        props.setName(formData["player-name"] as string);
    }


    return (
        <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
        >
            <Card
                sx={{
                    "display": "flex",
                    "mt": 10,
                    "p": 5,
                    "mb": 5,
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
                        Player settings
                    </Typography>

                    <Box mb={3}>
                        <TextField
                            name="player-name"
                            placeholder="Player name"
                            sx={{
                                width: "300px",
                                maxWidth: "300px",
                            }}
                            error={!!errors.playerName}
                            helperText={errors.playerName}
                        />
                    </Box>

                    <Box
                        mb={7}
                        display={"flex"}
                        alignItems={"flex-start"}
                        width={"100%"}
                        pl={2}
                    >
                        <FormControlLabel
                            control={<Checkbox
                                name={"remember-player-name"}
                                defaultChecked />
                            }
                            label="Remember player name"
                        />
                    </Box>

                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            width: "100%",
                            maxWidth: "300px",
                            marginBottom: 2,
                        }}
                    >
                        Continue
                    </Button>
                </Box>
            </Card>
        </Box>
    )
}