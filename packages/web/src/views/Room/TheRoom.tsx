import React, { useState } from "react";
import { useParams } from 'react-router-dom';

import { useSocketContext } from "../../hooks/useSocketContext";
import { TheRoomInitialization } from "./_TheRoomInitialization";
import { TheRoomOverview } from "./_TheRoomOverview";


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
        return <TheRoomOverview
            name={name}
            roomId={roomId}
            socket={socketState.socket}
            api={socketState.api}
        />
    } else {
        return <TheRoomInitialization
            roomId={roomId}
            socket={socketState.socket}
            setName={setName}
        />
    }
}