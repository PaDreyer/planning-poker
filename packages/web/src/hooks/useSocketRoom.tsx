import type { Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { EventStatus, RoomUpdateReason } from "@planning-poker/shared";

type UserData = {
    id: string;
    name: string;
    voted: boolean;
    priority: number | undefined;
    weight: number | undefined;
    isAdmin: boolean;
}

type RoomUpdatePayload = {
    revealed: boolean;
    userData: UserData[];
    roomSettings: {
        name: string;
        possibleWeights: number[];
        possiblePriorities: number[];
        votedPriority: number | undefined;
        votedWeight: number | undefined;
    }
    updateReason: RoomUpdateReason;
}

type RoomData = {
    initialized: boolean;
    userData: UserData[];
    revealed: boolean;
    roomId: string | undefined;
    roomName: string | undefined;
    possibleWeights: number[];
    possiblePriorities: number[];
    votedPriority: number | undefined;
    votedWeight: number | undefined;
    error: Error | undefined;
    kicked: boolean;
    updateReason: RoomUpdateReason | undefined;
    lastUpdate: Date | undefined;
}

/**
 * Join room to vote
 * @param socket
 * @param name
 * @param roomId
 */
export function useSocketRoom(socket: Socket, name: string, roomId: string): RoomData {
    const [ roomData, setRoomData] = useState<RoomData>({
        initialized: false,
        userData: [],
        roomId,
        roomName: undefined,
        possibleWeights: [],
        possiblePriorities: [],
        votedPriority: undefined,
        votedWeight: undefined,
        revealed: false,
        error: undefined,
        kicked: false,
        updateReason: undefined,
        lastUpdate: undefined,
    });

    useEffect(() => {
        function handleRoomUpdate(payload: RoomUpdatePayload) {
            setRoomData(prev => ({
                ...prev,
                initialized: true,
                roomName: payload.roomSettings.name,
                possibleWeights: payload.roomSettings.possibleWeights,
                possiblePriorities: payload.roomSettings.possiblePriorities,
                votedPriority: payload.roomSettings.votedPriority,
                votedWeight: payload.roomSettings.votedWeight,
                revealed: payload.revealed,
                userData: payload.userData || [],
                updateReason: payload.updateReason,
                lastUpdate: new Date(),
            }));
        }

        function handleKicked() {
            setRoomData(prev => ({
                ...prev,
                kicked: true,
            }));
        }

        socket.emit('join-room', { roomId, name }, (res: EventStatus) => {
            if (res.success) {
                socket.on("room-update", handleRoomUpdate);
                socket.on("kicked", handleKicked);
                setRoomData(prev => ({
                    ...prev,
                    initialized: true,
                    roomId,
                    error: undefined,
                    updateReason: undefined,
                    lastUpdate: new Date(),
                }));
            } else {
                setRoomData(prev => ({
                    ...prev,
                    initialized: true,
                    error: new Error(res.message),
                    updateReason: undefined,
                    lastUpdate: new Date(),
                }));
            }
        });

        return () => {
            socket.off("room-update", handleRoomUpdate);
            socket.off("kicked", handleKicked);
            socket.emit("leave", { roomId });
        }
    }, []);

    return roomData;
}