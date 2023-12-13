import type { Socket } from "socket.io-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import Lottie from "lottie-react";

import type { SocketApi } from "../../api/socket-api";
import { useSocketRoom } from "../../hooks/useSocketRoom";
import { RoomPanel } from "../../components/RoomPanel/RoomPanel";
import { VoteMatrix } from "../../components/VoteMatrix/VoteMatrix";
import { AdminPanel } from "../../components/AdminPanel/AdminPanel";
import { UserList } from "../../components/UserList/UserList";
import animationData from "../../assets/img/Same-Voted-Animation.json";


type TheRoomOverviewProps = {
    name: string;
    roomId: string;
    socket: Socket;
    api: SocketApi;
}

/**
 * Join room to vote
 * @param socket SocketIO-Client socket
 * @param name Player name
 * @param roomId Room id
 * @param api Socket api
 */
export function TheRoomOverview({ socket, name, roomId, api }: TheRoomOverviewProps) {
    const roomData = useSocketRoom(socket, name, roomId);
    const [selectedWeight, setSelectedWeight] = useState<number | undefined>(undefined);
    const [selectedPriority, setSelectedPriority] = useState<number | undefined>(undefined);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [showFancyAnimation, setShowFancyAnimation] = useState<boolean>(false);

    const amIAdmin = useMemo(() => {
        const adminId = roomData.userData.find(user => user.isAdmin)?.id;
        return adminId === socket.id;
    }, [roomData.userData, socket.id])

    const handleKick = useCallback((socketId: string) => {
        api.kick({ roomId, socketId })
            .then(() => enqueueSnackbar("User was kicked", { variant: "success" }))
            .catch(e => enqueueSnackbar(e, { variant: "error" }));
    }, [api, roomId]);

    const handleAdminReset = useCallback(() => {
        api.reset({ roomId })
            .then()
            .catch(e => enqueueSnackbar(e, { variant: "error" }));
    }, [api, roomId]);

    const handleAdminReveal = useCallback(() => {
        api.reveal({ roomId })
            .then()
            .catch(e => enqueueSnackbar(e, { variant: "error" }));
    }, [api, roomId]);

    // Reset selected votes when admin resets or reveals
    useEffect(() => {
        if (roomData.updateReason === "admin-reset") {
            setSelectedWeight(undefined);
            setSelectedPriority(undefined);
            setDisabled(false);
        } else if(roomData.updateReason === "admin-revealed") {
            setSelectedWeight(undefined);
            setSelectedPriority(undefined);
            setDisabled(true);
        }
    }, [roomData.updateReason, roomData.lastUpdate]);

    // Vote when both weight and priority are selected
    useEffect(() => {
        if (selectedWeight && selectedPriority) {
            api.vote({ roomId, weight: selectedWeight, priority: selectedPriority }).then();
        }
    }, [selectedWeight, selectedPriority]);

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
        if (
            roomData.revealed &&
            roomData.userData.every(user => user.priority === roomData.votedPriority && user.weight === roomData.votedWeight) &&
            roomData.updateReason === "admin-revealed"
        ) {
            setShowFancyAnimation(true);
        } else {
            setShowFancyAnimation(false);
        }
    }, [roomData.revealed, roomData.userData, roomData.votedPriority, roomData.votedWeight]);

    const userListData = useMemo(() => roomData.userData.map(user => ({
        id: user.id,
        name: user.name,
        isAdmin: user.isAdmin,
        voted: user.voted,
        priority: user.priority,
        weight: user.weight,
    })), [roomData.userData]);

    if (!roomData.initialized) {
        // TODO render better loading screen while initializing room
        return <div>Initializing...</div>
    }

    if (roomData.error) {
        setTimeout(
            () => enqueueSnackbar(roomData.error?.message, { variant: "error" }),
            250
        );
        return <Navigate to={"/"} />
    }

    if (roomData.kicked) {
        setTimeout(
            () => enqueueSnackbar("You were kicked from the room", { variant: "error" }),
            250
        );
        return <Navigate to={"/"} />
    }

    return (
        <>
            { showFancyAnimation &&
                <Lottie
                    style={{
                        top: "200px",
                        position: "absolute",
                        width: "100%",
                        height: "80%"
                    }}
                    animationData={animationData}
                    loop={false}
                    onComplete={() => setShowFancyAnimation(false)}
                />
            }
            <Box sx={{ mx: { xs: 0, sm: 2 } }}>
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
                    <AdminPanel onReset={handleAdminReset} onReveal={handleAdminReveal} />
                }
                <UserList usedByAdmin={amIAdmin} users={userListData} handleKick={handleKick} />
            </Box>
        </>
    )
}