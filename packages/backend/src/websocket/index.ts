import type { Server } from 'http';
import type { SocketServer, Socket } from "@planning-poker/shared";
import { Server as SocketIOServer } from 'socket.io';
import { registerSocketHandler } from "./socket-handler";

export function createWebsocketServer(server: Server) {
    const io: SocketServer = new SocketIOServer(server);

    io.on("connect", (socket: Socket) => registerSocketHandler(io, socket));
}