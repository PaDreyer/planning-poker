import type { ZodType } from 'zod';
import type {
    ChainFn,
    Socket,
    SocketServer,
    ClientCallback,
    EventStatus,
} from "@planning-poker/shared";
import {
    getMetadataOfRoom,
    isSocketRoomAdmin,
    notifyRoomForUpdatedUserStates,
    resetDataOfSocketsInRoom
} from "../websocket/socket-helper";


export const payloadValidationChain = <T extends ZodType<S>, S, P>(schema: T): ChainFn<[SocketServer, Socket, P, ClientCallback]> => {
    return (io: SocketServer, socket: Socket, payload: P, cb: ClientCallback) => {
        const validationResult = schema.safeParse(payload);

        if (!validationResult.success) {
            cb({message: validationResult.error.toString(), success: false});
            return false;
        }

        return true;
    }
}

export const mapDataToSocketChain = <P extends {}>(mapperFn: (socket: Socket, payload: P) => void): ChainFn<[SocketServer, Socket, P, ClientCallback]> => {
    return (io: SocketServer, socket: Socket, payload: P, cb: ClientCallback) => {
        try {
            mapperFn(socket, payload);
            return true;
        } catch(e) {
            console.log("error: ", e);
            return false;
        }
    }
}

export const joinRoomChain = <P extends { roomId: string }>(): ChainFn<[SocketServer, Socket, P, ClientCallback]> => {
    return (io: SocketServer, socket: Socket, payload: P, cb: ClientCallback) => {
        socket.join(payload.roomId);
        return true;
    }
}

export const sendResponseChain = <P>(status: EventStatus): ChainFn<[SocketServer, Socket, P, ClientCallback]> => {
    return (io: SocketServer, socket: Socket, payload: any, cb: ClientCallback) => {
        cb(status);
        return true;
    }
}

export const notifyRoomMemberChain = <P extends { roomId: string }>(): ChainFn<[SocketServer, Socket, P, ClientCallback]> => {
    return async (io: SocketServer, socket: Socket, payload: any, cb: ClientCallback) => {
        const { roomId } = payload;
        await notifyRoomForUpdatedUserStates(io, roomId, "room-settings-updated");
        return true;
    }
}

export const verifyIsRoomMemberChain = <P extends { roomId: string }>(): ChainFn<[SocketServer, Socket, P, ClientCallback]> => {
    return (io: SocketServer, socket: Socket, payload: any, cb: ClientCallback) => {
        const { roomId } = payload;

        if (!socket.data[roomId]) {
            cb({ message: 'You are not a member of this room', success: false });
            return false;
        }

        return true;
    }
}

export const ensureRoomIsNotRevealedChain = <P extends { roomId: string }>(): ChainFn<[SocketServer, Socket, P, ClientCallback]> => {
    return async (io: SocketServer, socket: Socket, payload: P, cb: ClientCallback) => {
        const roomMetadata = await getMetadataOfRoom(io, payload.roomId);


        if (!roomMetadata) {
            cb({ message: 'Internal server error', success: false });
            return false;
        }

        if (roomMetadata.revealed) {
            cb({ message: 'Room is already revealed', success: false });
            return false;
        }

        return true;
    }
}

export const validateAllowedVoteValuesChain = <P extends { roomId: string, weight: number, priority: number }>(): ChainFn<[SocketServer, Socket, P, ClientCallback]> => {
    return async (io: SocketServer, socket: Socket, payload: P, cb: ClientCallback) => {
        const roomMetadata = await getMetadataOfRoom(io, payload.roomId);

        if (!roomMetadata) {
            cb({ message: 'Internal server error', success: false });
            return false;
        }

        const { weight, priority } = payload;

        if (!roomMetadata.possibleWeights.includes(weight)) {
            cb({ message: 'Weight is not allowed', success: false });
            return false;
        }

        if (!roomMetadata.possiblePriorities.includes(priority)) {
            cb({ message: 'Priority is not allowed', success: false });
            return false;
        }

        return true;
    }
}

export const ensureMemberIsAdminChain = <P extends { roomId: string }>(): ChainFn<[SocketServer, Socket, P, ClientCallback]> => {
    return (io: SocketServer, socket: Socket, payload: P, cb: ClientCallback) => {
        if (!isSocketRoomAdmin(socket, payload.roomId)) {
            cb({ message: 'You are not allowed to do that', success: false });
            return false;
        }

        return true;
    }
}

export const ensureAllMemberVotedChain = <P extends { roomId: string }>(): ChainFn<[SocketServer, Socket, P, ClientCallback]> => {
    return async (io: SocketServer, socket: Socket, payload: P, cb: ClientCallback) => {
        const roomSockets = await io.in(payload.roomId).fetchSockets();
        const everySocketVoted = roomSockets.every(
            (socket) => socket.data[payload.roomId].voted
        );

        if (!everySocketVoted) {
            cb({ message: 'Not every socket has voted', success: false });
            return false;
        }

        return true;
    }
}

export const resetDataOfSocketsInRoomChain = <P extends { roomId: string }>(): ChainFn<[SocketServer, Socket, P, ClientCallback]> => {
    return async (io: SocketServer, socket: Socket, payload: P, cb: ClientCallback) => {
        await resetDataOfSocketsInRoom(io, payload.roomId);

        return true;
    }
}

export const leaveSocketChain = <P extends { roomId: string }>(): ChainFn<[SocketServer, Socket, P, ClientCallback]> => {
    return (io: SocketServer, socket: Socket, payload: P, cb: ClientCallback) => {
        socket.leave(payload.roomId);
        return true;
    }
}