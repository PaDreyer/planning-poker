import type {
    RemoteSocket,
    Socket,
    SocketServer,
    RoomMetadata,
    RoomUpdateReason,
} from '@planning-poker/shared';


/**
 * Send room update notification to members of a room
 * @param io
 * @param roomId
 * @param updateReason
 */
export async function notifyRoomForUpdatedUserStates(
    io: SocketServer,
    roomId: string,
    updateReason: RoomUpdateReason
): Promise<void> {
    const socketsOfRoom = await io.in(roomId).fetchSockets();

    const adminSocket = socketsOfRoom.find(socket => socket.data[roomId].isAdmin);
    const reveal = adminSocket?.data[roomId]._meta!.revealed ?? false;

    const roomMeta = adminSocket!.data[roomId]._meta!;
    const roomSettings = {
        roomId,
        name: roomMeta.name,
        possibleWeights: roomMeta.possibleWeights,
        possiblePriorities: roomMeta.possiblePriorities,
        votedPriority: roomMeta.votedPriority,
        votedWeight: roomMeta.votedWeight,
    }

    const userData = socketsOfRoom.map(socket => ({
        id: socket.id,
        name: socket.data[roomId].name,
        voted: socket.data[roomId].voted,
        weight: reveal ? socket.data[roomId].weight : null,
        priority: reveal ? socket.data[roomId].priority : null,
        isAdmin: socket.data[roomId].isAdmin,
    }));

    // Implement room settings here
    io.in(roomId).emit("room-update", { userData, revealed: reveal, roomSettings, updateReason });
}

/**
 * Check if a socket is admin of a room
 * @param socket
 * @param roomId
 */
export function isSocketRoomAdmin(socket: Socket | RemoteSocket, roomId: string): boolean {
    return !!socket.data[roomId]?.isAdmin;
}

/**
 * Check if a socket is in a room
 * @param socket
 * @param roomId
 */
export function socketIsInRoom(socket: Socket, roomId: string): boolean {
    return !!socket.data[roomId];
}

/**
 * Get admin of a room
 * @param io
 * @param roomId
 */
export async function getAdminOfRoom(io: SocketServer, roomId: string): Promise<RemoteSocket | undefined> {
    const socketsOfRoom = await io.in(roomId).fetchSockets();
    return socketsOfRoom.find(socket => socket.data[roomId].isAdmin);
}

/**
 * Get metadata of a room
 * @param io
 * @param roomId
 */
export async function getMetadataOfRoom(io: SocketServer, roomId: string): Promise<RoomMetadata | undefined> {
    const adminOfRoom = await getAdminOfRoom(io, roomId);
    return adminOfRoom?.data[roomId]._meta;
}

/**
 * Check if a room exists
 * @param io
 * @param roomId
 */
export function checkIfRoomExists(io: SocketServer, roomId: string): boolean {
    const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    return roomSize !== 0;
}

/**
 * Update metadata of a room
 * @param io
 * @param roomId
 * @param metadata
 */
export async function updateRoomMetadata(io: SocketServer, roomId: string, metadata: Partial<RoomMetadata>) {
    const adminSocket = await getAdminOfRoom(io, roomId);
    if (!adminSocket) {
        return false;
    }

    if (!adminSocket.data[roomId]._meta) {
        return false;
    }

    adminSocket.data[roomId]._meta = {
        ...adminSocket.data[roomId]._meta!,
        ...metadata,
    };

    return true;
}

/**
 * Reset data of all sockets in a room
 * @param io
 * @param roomId
 */
export async function resetDataOfSocketsInRoom(io: SocketServer, roomId: string) {
    const socketsOfRoom = await io.in(roomId).fetchSockets();
    socketsOfRoom.forEach(socket => {
        const isAdmin = isSocketRoomAdmin(socket, roomId);
        socket.data[roomId] = {
            isAdmin,
            name: socket.data[roomId].name,
            voted: false,
            weight: null,
            priority: null,
            _meta: !isAdmin ? undefined : {
                ...socket.data[roomId]._meta!,
                votedPriority: undefined,
                votedWeight: undefined,
                revealed: false,
            }
        }
    });
}

/**
 * Transfer admin metadata to a new user in a room
 * @param io
 * @param roomId
 * @param roomMeta
 */
export async function transferAdminMetadataToNewUserInRoom(io: SocketServer, roomId: string, roomMeta: RoomMetadata): Promise<boolean> {
    const socketsOfRoom = await io.in(roomId).fetchSockets();
    const newAdminSocket = socketsOfRoom.find(socket => !socket.data[roomId].isAdmin);

    if (!newAdminSocket) {
        return false;
    }

    newAdminSocket.data[roomId] = {
        ...newAdminSocket.data[roomId],
        _meta: {
            ...roomMeta,
            revealed: false,
            votedPriority: undefined,
            votedWeight: undefined,
        },
        isAdmin: true,
    };

    return true;
}