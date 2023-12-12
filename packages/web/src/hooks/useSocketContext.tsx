import { useContext } from "react";

import { SocketContext } from "../provider/socket";
import type { SocketState } from "./useSocket";

export function useSocketContext(): SocketState {
    return useContext(SocketContext);
}