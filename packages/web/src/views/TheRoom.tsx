import React, { useEffect, useState } from "react";
import { useParams, Navigate } from 'react-router-dom';
import type { Socket } from "socket.io-client";
import {
    Box,
    Button,
    Card,
    Checkbox,
    FormControlLabel,
    TextField,
    Typography
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import Lottie from "lottie-react";

import { useSocketRoom } from "../hooks/useSocketRoom";
import { useSocketContext } from "../hooks/useSocketContext";
import { SocketApi } from "../api/socket-api";
import { UserList } from "../components/UserList/UserList";
import { RoomPanel } from "../components/RoomPanel/RoomPanel";
import { VoteMatrix } from "../components/VoteMatrix/VoteMatrix";
import { AdminPanel } from "../components/AdminPanel/AdminPanel";
import animationData from "../assets/img/Same-Voted-Animation.json";

/**
 * Enter room
 *
 * Check for player name and if not set ask for it
 * @constructor
 */
export function TheRoom() {
    const playerName = localStorage.getItem("player-name");
    const [name, setName] = useState<string | undefined>(playerName ?? undefined);
    const socketState = useSocketContext();
    const { roomId } = useParams<{ roomId: string }>();
    const [errors, setErrors] = useState<{
        playerName: undefined | string;
    }>({
        playerName: undefined,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
        setName(formData["player-name"] as string);
    }

    if (!roomId) {
        return <div>Invalid room id</div>
    }

    if (!socketState.socket) {
        return <div>Socket not initialized</div>
    }

    if (!socketState.api) {
        return <div>Socket api not initialized</div>
    }

    if (name) {
        return <TheRoomInitialized name={name} roomId={roomId} socket={socketState.socket} api={socketState.api} />
    } else {
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

                        <Box
                            mb={3}
                        >
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
}

type TheRoomInitializedProps = {
    name: string;
    roomId: string;
    socket: Socket;
    api: SocketApi;
}

/**
 * Join room to vote
 * @param socket
 * @param name
 * @param roomId
 * @param api
 * @constructor
 */
function TheRoomInitialized({ socket, name, roomId, api }: TheRoomInitializedProps) {
    const roomData = useSocketRoom(socket, name, roomId);
    const [selectedWeight, setSelectedWeight] = useState<number | undefined>(undefined);
    const [selectedPriority, setSelectedPriority] = useState<number | undefined>(undefined);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [showFancyAnimation, setShowFancyAnimation] = useState<boolean>(false);

    const adminId = roomData.userData.find(user => user.isAdmin)?.id;
    const amIAdmin = adminId === socket.id;

    useEffect(() => {
        if (roomData.updateReason === "admin-reset") {
            setSelectedWeight(undefined);
            setSelectedPriority(undefined);
            setDisabled(false);
        }
    }, [roomData.updateReason, roomData.lastUpdate]);

    // Vote when both weight and priority are selected
    useEffect(() => {
        if (selectedWeight && selectedPriority) {
            api.vote({ roomId, weight: selectedWeight, priority: selectedPriority }).then();
        }
    }, [selectedWeight, selectedPriority]);

    // Reset selected votes when room is revealed
    useEffect(() => {
        if (selectedWeight && selectedPriority && roomData.revealed) {
            setSelectedWeight(undefined);
            setSelectedPriority(undefined);
            setDisabled(true);
        }
    }, [selectedWeight, selectedPriority, roomData.revealed]);

    // Enable voting when room is not revealed and user has not voted
    useEffect(() => {
        if (!selectedWeight && !selectedPriority && !roomData.revealed) {
            setDisabled(false);
        } else if(!selectedWeight && !selectedPriority && roomData.revealed) {
            setDisabled(true);
        }
    }, [selectedWeight, selectedPriority, roomData.revealed]);

    // Set document title when room is initialized and show snackbar with room name
    useEffect(() => {
        if (roomData.initialized && roomData.roomName) {
            document.title = `Planning Poker - ${roomData.roomName}`;
            enqueueSnackbar(`Joined room ${roomData.roomName}`, { variant: "success" });
        }
    }, [roomData.initialized, roomData.roomName]);

    // Show fancy animation if every user voted the same
    useEffect(() => {
        if (roomData.revealed && roomData.userData.every(user => user.priority === roomData.votedPriority && user.weight === roomData.votedWeight)) {
            setShowFancyAnimation(true);
        } else {
            setShowFancyAnimation(false);
        }
    }, [roomData.revealed, roomData.userData, roomData.votedPriority, roomData.votedWeight]);

    // Room is not initialized yet
    if (!roomData.initialized) {
        return <div>Initializing...</div>
    }

    // Error occurred while initializing room
    if (roomData.error) {
        setTimeout(() => enqueueSnackbar(roomData.error?.message, { variant: "error" }), 250);
        return <Navigate to={"/"} />
    }

    const userListData = roomData.userData.map(user => ({
        name: user.name,
        isAdmin: user.isAdmin,
        voted: user.voted,
        priority: user.priority,
        weight: user.weight,
    }));

    return (
        <>
            { showFancyAnimation &&
                <Lottie
                    style={{
                        display: "flex",
                        zIndex: -1,
                        position: "absolute",
                        alignSelf: "center",
                        width: "100%",
                        height: "80%"
                    }}
                    animationData={animationData}
                    loop={false}
                    onComplete={() => setShowFancyAnimation(false)}
                />
            }
            <Box sx={{
                mx: {
                    xs: 0,
                    sm: 4,
                    md: 8,
                }
            }}>
                <RoomPanel
                    roomName={roomData.roomName}
                    revealed={roomData.revealed}
                    priority={roomData.votedPriority}
                    weight={roomData.votedWeight}
                />
                <Box
                    display={"flex"}
                    width={"100%"}
                    justifyContent={"space-around"}
                    flexDirection={"row"}
                >
                    <Box display="flex" maxWidth={"50%"}>
                        <VoteMatrix
                            label={"Priority"}
                            selectedVote={selectedPriority}
                            possibleVotes={roomData.possiblePriorities}
                            setVote={(vote) => setSelectedPriority(vote)}
                            disabled={disabled}
                        />
                    </Box>
                    <Box display="flex" maxWidth={"50%"}>
                        <VoteMatrix
                            label={"Weight"}
                            selectedVote={selectedWeight}
                            possibleVotes={roomData.possibleWeights}
                            setVote={(vote) => setSelectedWeight(vote)}
                            disabled={disabled}
                        />
                    </Box>
                </Box>
                { amIAdmin &&
                    <AdminPanel
                        onReset={() => api.reset({ roomId }).catch(e => enqueueSnackbar(e, { variant: "error" }))}
                        onReveal={() => api.reveal({ roomId }).catch(e => enqueueSnackbar(e, { variant: "error" }))}
                    />
                }
                <UserList users={userListData} />
            </Box>
        </>
    )
}