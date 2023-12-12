import {createContext, PropsWithChildren} from 'react';

import {SocketState, useSocket, UseSocketOptions} from "../hooks/useSocket";

type SocketContextType = SocketState

const DefaultSocketContext: SocketContextType = {
    api: null,
    socket: null,
    error: null,
    connected: false,
    connecting: false,
}

export const SocketContext = createContext<SocketContextType>(DefaultSocketContext);

export type SocketProviderProps = {
    url: string;
    options?: UseSocketOptions;
}

export function SocketProvider(props: PropsWithChildren<SocketProviderProps>) {
    const socketState = useSocket(props.url, props.options);

    if (socketState.error) {
        return <div>Socket error: { socketState.error }</div>
    }

    if (socketState.connecting) {
        return <div>Connecting...</div>
    }

    if (!socketState.connected) {
        return <div>Not connected</div>
    }

    return <SocketContext.Provider value={socketState}>
        { props.children }
    </SocketContext.Provider>
}