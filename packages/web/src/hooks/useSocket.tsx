import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { Socket, SocketOptions, ManagerOptions } from "socket.io-client";

import { SocketApi } from "../api/socket-api";

export type SocketState = {
    api: SocketApi | null;
    socket: Socket | null;
    connected: boolean;
    connecting: boolean;
    error: string | null;
};

export type UseSocketOptions = Partial<ManagerOptions> & Partial<SocketOptions>;

export function useSocket(url: string, options?: UseSocketOptions): SocketState {
    const [api, setApi] = useState<SocketApi | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        function handleConnect() {
            setConnecting(false);
            setConnected(true);
        }

        function handleConnectError(err: Error) {
            setConnecting(false);
            setError(err.message);
        }

        function handleDisconnect() {
            setConnecting(false);
            setConnected(false);
            setSocket(null);
            setError(null);
            setApi(null);
        }

        if (!socket) {
            const newSocket = io("/", options);
            const socketApi = new SocketApi(newSocket);
            setConnecting(true);
            newSocket.on("connect", handleConnect);
            newSocket.on("connect_error", handleConnectError);
            newSocket.on('disconnect', handleDisconnect);
            setSocket(newSocket);
            setApi(socketApi);
        }

        return () => {
            if (socket) {
                socket.off("connect", handleConnect);
                socket.off("connect_error", handleConnectError);
                socket.off("disconnect", handleDisconnect);
            }
        }
    }, [ socket, options ]);

    return {
        api,
        socket,
        connecting,
        connected,
        error
    }
}