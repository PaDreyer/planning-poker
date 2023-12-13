import type { Socket as _Socket, Server as _Server, RemoteSocket as _RemoteSocket } from "socket.io";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";

export type SocketServer = _Server<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>;
export type Socket = _Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>;
export type RemoteSocket = _RemoteSocket<ServerToClientEvents, SocketData>;

export type ClientCallback = (status: EventStatus) => void;

type ClientToServerEvents = {
    "connect": (socket: Socket) => void;
    "create-room": (roomSettings: RoomSettings, cb: ClientCallback) => void;
    "join-room": (joinOptions: JoinOptions, cb: ClientCallback) => void;
    "vote": (voteOptions: VoteOptions, cb: ClientCallback) => void;
    "reveal": (revealOptions: RevealOptions, cb: ClientCallback) => void;
    "reset": (resetOptions: ResetOptions, cb: ClientCallback) => void;
    "kick": (kickOptions: KickOptions, cb: ClientCallback) => void;
    "leave": (leaveOptions: LeaveOptions) => void;
    "disconnect": () => void;
};

type ServerToClientEvents = {
    "room-update": (data: RoomUpdate) => void;
    "kicked": () => void;
}

export interface RoomMetadata {
    revealed: boolean;
    name?: string;
    possibleWeights: number[];
    possiblePriorities: number[];
    votedWeight: number | undefined;
    votedPriority: number | undefined;
}

interface SocketDataRoom {
    name?: string;
    voted: boolean;
    weight: number | null;
    priority: number | null;
    isAdmin: boolean;
    _meta?: RoomMetadata;
}

interface SocketData {
    [key: string]: SocketDataRoom;
}

export type RoomUpdateReason = "user-joined" | "user-left" | "user-voted" | "admin-reset" | "admin-revealed" | "room-settings-updated";
export interface RoomUpdate {
    // TODO move "revealed" to "roomSettings"
    revealed: boolean;
    userData: Array<Omit<SocketDataRoom, "_meta">>;
    roomSettings: RoomSettings;
    updateReason: RoomUpdateReason;
}

export interface RoomSettings {
    roomId: string;
    name: string | undefined;
    possibleWeights: number[];
    possiblePriorities: number[];
    votedPriority: number | undefined;
    votedWeight: number | undefined;
}

export interface CreateOptions {
    roomId: string;
    name: string | undefined;
    possibleWeights: number[] | undefined;
    possiblePriorities: number[] | undefined;
}

export interface JoinOptions {
    roomId: string;
    name: string;
}

export interface VoteOptions {
    roomId: string;
    weight: number;
    priority: number;
}

export interface RevealOptions {
    roomId: string;
}

export interface ResetOptions {
    roomId: string;
}

export interface KickOptions {
    roomId: string;
    socketId: string;
}

export interface LeaveOptions {
    roomId: string;
}

export interface EventStatus {
    message: string;
    success: boolean;
}
