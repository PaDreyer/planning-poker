import type { Socket } from "socket.io-client";
import type { CreateOptions, EventStatus } from "@planning-poker/shared";

/**
 * Socket API
 */
export class SocketApi {
    constructor(private readonly socket: Socket) {}

    async createRoom(createOptions: CreateOptions): Promise<string> {
        return await new Promise((resolve, reject) => {
            this.socket.emit("create-room", createOptions, (res: EventStatus) => {
                if (res.success) {
                    resolve(res.message)
                } else {
                    reject(res.message);
                }
            });
        });
    }

    /**
     * Vote for a task in a room
     * @param weight
     * @param priority
     * @param roomId
     */
    async vote({ roomId, weight, priority }: { roomId: string, weight: number, priority: number }): Promise<string> {
        return await new Promise((resolve, reject) => {
            this.socket.emit("vote", { weight, priority, roomId }, (res: EventStatus) => {
                if (res.success) {
                    resolve(res.message)
                } else {
                    reject(res.message);
                }
            });
        });
    }

    /**
     * Reveal the votes of the room
     *
     * Only callable by admin of the room
     * @param roomId
     */
    async reveal({ roomId }: { roomId: string }): Promise<string> {
        return await new Promise((resolve, reject) => {
            this.socket.emit("reveal", { roomId }, (res: EventStatus) => {
                if (res.success) {
                    resolve(res.message);
                } else {
                    reject(res.message);
                }
            });
        });
    }

    /**
     * Reset the room
     *
     * Only callable by admin of the room
     * @param roomId
     */
    async reset({ roomId }: { roomId: string }): Promise<string> {
        return await new Promise((resolve, reject) => {
            this.socket.emit("reset", { roomId }, (res: EventStatus) => {
                if (res.success) {
                    resolve(res.message);
                } else {
                    reject(res.message);
                }
            });
        });
    }
}