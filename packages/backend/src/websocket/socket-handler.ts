import type {
    Socket,
    SocketServer,
    ClientCallback,
    JoinOptions,
    VoteOptions,
    RevealOptions,
    ResetOptions,
    CreateOptions,
    LeaveOptions,
} from '@planning-poker/shared';
import {
    CreateOptionsValidation,
    JoinOptionsValidation,
    VoteOptionsValidation,
    RevealOptionsValidation,
    ResetOptionsValidation,
    LeaveOptionsValidation,
    KickOptionsValidation,
} from '@planning-poker/shared';
import {
    checkIfRoomExists,
    getMetadataOfRoom,
    isSocketRoomAdmin,
    notifyRoomForUpdatedUserStates,
    resetDataOfSocketsInRoom,
    socketIsInRoom,
    transferAdminMetadataToNewUserInRoom,
    updateRoomMetadata,
} from "./socket-helper";


export function registerSocketHandler(io: SocketServer, socket: Socket) {
    socket.on(
        "create-room",
        (createOptions: CreateOptions, cb: ClientCallback) => {
            const validationResult = CreateOptionsValidation
                .safeParse(createOptions);

            if (!validationResult.success) {
                return cb({ message: validationResult.error.toString(), success: false })
            }

            const {
                name,
                roomId,
                possiblePriorities,
                possibleWeights,
            } = validationResult.data;

            socket.data[roomId] = {
                isAdmin: true,
                name: undefined,
                voted: false,
                weight: null,
                priority: null,
                _meta: {
                    revealed: false,
                    name: name,
                    possiblePriorities: possiblePriorities ?? [1,2,3],
                    possibleWeights: possibleWeights ?? [1,2,5,13,21,34],
                    votedPriority: undefined,
                    votedWeight: undefined,
                }
            };

            socket.join(roomId);

            return cb({ message: 'Created room', success: true });
        }
    );

    // Join room and send list of users in room
    socket.on(
        "join-room",
        async (joinOptions: JoinOptions, cb: ClientCallback) => {
            const validationResult = JoinOptionsValidation
                .safeParse(joinOptions);

            if (!validationResult.success) {
                return cb({ message: validationResult.error.toString(), success: false })
            }

            const { roomId, name } = validationResult.data;

            if (!checkIfRoomExists(io, roomId)) {
                return cb({ message: 'Room does not exist', success: false });
            }

            const isAdmin = isSocketRoomAdmin(socket, roomId);
            if (!isAdmin) {
                socket.data[roomId] = {
                    isAdmin,
                    name,
                    voted: false,
                    weight: null,
                    priority: null,
                };
            } else {
                socket.data[roomId].name = name;
            }

            // Add basic metadata to every socket
            socket.join(roomId);

            // Order important, otherwise listeners would not get first room update
            cb({ message: 'Joined room', success: true });
            await notifyRoomForUpdatedUserStates(io, roomId, "user-joined").then();
        }
    );

    // Save vote of user and notify other users in room
    socket.on(
        "vote",
        async (voteOptions: VoteOptions, cb: ClientCallback) => {
            const validationResult = VoteOptionsValidation
                .safeParse(voteOptions);

            if (!validationResult.success) {
                return cb({ message: validationResult.error.toString(), success: false })
            }

            const { roomId, weight, priority } = validationResult.data;

            if (!socketIsInRoom(socket, roomId)) {
                return cb({ message: 'You are not in this room', success: false });
            }

            const roomMetadata = await getMetadataOfRoom(io, roomId);
            if (!roomMetadata) {
                return cb({ message: 'Internal server error', success: false });
            }

            if (roomMetadata.revealed) {
                return cb({ message: 'Room is revealed', success: false });
            }

            const possibleWeights = roomMetadata.possibleWeights;
            if (!possibleWeights?.includes(weight)) {
                return cb({ message: 'Weight is not allowed', success: false });
            }
            const possiblePriorities = roomMetadata.possiblePriorities;
            if (!possiblePriorities?.includes(priority)) {
                return cb({ message: 'Priority is not allowed', success: false });
            }

            socket.data[roomId].voted = true;
            socket.data[roomId].weight = weight;
            socket.data[roomId].priority = priority;

            await notifyRoomForUpdatedUserStates(io, roomId, "user-voted");
            return cb({ message: 'Voted', success: true });
        }
    );

    // Reveal votes and notify other users in room with votes
    socket.on(
        "reveal",
        async (revealOptions: RevealOptions, cb: ClientCallback) => {
            const validationResult = RevealOptionsValidation
                .safeParse(revealOptions);
            if (!validationResult.success) {
                return cb({ message: validationResult.error.toString(), success: false })
            }

            const { roomId } = validationResult.data;

            if (!isSocketRoomAdmin(socket, roomId)) {
                return cb({ message: 'You are not allowed to do that', success: false });
            }

            // Check if every socket has voted
            const roomSockets = await io.in(roomId).fetchSockets();
            const everySocketVoted = roomSockets.every(
                (socket) => socket.data[roomId].voted
            );
            if (!everySocketVoted) {
                return cb({ message: 'Not every socket has voted', success: false });
            }

            // calculate voted average of all sockets in room which voted
            const { votedWeight, votedPriority } = roomSockets.reduce((acc, socket, index, list) => {
                if (socket.data[roomId].voted) {
                    acc.votedWeight += socket.data[roomId].weight!;
                    acc.votedPriority += socket.data[roomId].priority!;
                }

                if (index === roomSockets.length - 1) {
                    acc.votedWeight = parseFloat((acc.votedWeight / list.length).toFixed(2));
                    acc.votedPriority = parseFloat((acc.votedPriority / list.length).toFixed(2));
                }

                return acc;
            }, {
                votedWeight: 0,
                votedPriority: 0,
            })

            const res = await updateRoomMetadata(io, roomId, {
                votedWeight,
                votedPriority,
                revealed: true,
            });
            if (!res) {
                return cb({ message: 'Internal server error', success: false });
            }

            await notifyRoomForUpdatedUserStates(io, roomId, "admin-revealed");
            return cb({ message: 'Revealed', success: true });
        }
    );

    // Reset votes and notify other users in room
    socket.on(
        "reset",
        async (resetOptions: ResetOptions, cb: ClientCallback) => {
            const validationResult = ResetOptionsValidation.safeParse(resetOptions);
            if (!validationResult.success) {
                return cb({ message: validationResult.error.toString(), success: false })
            }

            const { roomId } = validationResult.data;
            if (!isSocketRoomAdmin(socket, roomId)) {
                return cb({ message: 'You are not allowed to do that', success: false });
            }

            await resetDataOfSocketsInRoom(io, roomId);
            await notifyRoomForUpdatedUserStates(io, roomId, "admin-reset");

            return cb({ message: 'Reset', success: true });
        }
    );

    socket.on(
        "kick",
        async (kickOptions: LeaveOptions, cb: ClientCallback) => {
            const validationResult = KickOptionsValidation.safeParse(kickOptions);
            if (!validationResult.success) {
                return cb({ message: validationResult.error.toString(), success: false })
            }

            const { roomId, socketId } = validationResult.data;
            if (!isSocketRoomAdmin(socket, roomId)) {
                return cb({ message: 'You are not allowed to do that', success: false });
            }

            const socketToKick = io.sockets.sockets.get(socketId);
            if (!socketToKick) {
                return cb({ message: 'Socket not found', success: false });
            }

            if (!socketIsInRoom(socketToKick, roomId)) {
                return cb({ message: 'Socket is not in room', success: false });
            }

            delete socketToKick.data[roomId];
            socketToKick.emit("kicked");
            socketToKick.leave(roomId);
            await notifyRoomForUpdatedUserStates(io, roomId, "user-left");

            return cb({ message: 'Kicked', success: true });
        }
    )

    socket.on(
        "leave",
        async (leaveOptions: LeaveOptions) => {
            const validationResult = LeaveOptionsValidation.safeParse(leaveOptions);
            if (!validationResult.success) {
                return;
            }

            const { roomId } = validationResult.data;
            const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
            if (roomSize <= 1) {
                return;
            }

            if (isSocketRoomAdmin(socket, roomId)) {
                const roomMeta = socket.data[roomId]._meta!;
                // If admin leaves room, transfer admin to next user
                await transferAdminMetadataToNewUserInRoom(io, roomId, roomMeta);
            }

            socket.leave(leaveOptions.roomId);
            await notifyRoomForUpdatedUserStates(io, roomId, "user-left");

            return;
        }
    )

    // Disconnect socket from all rooms and ensure room admin
    socket.on("disconnecting", async () => {
        const rooms = Array.from(socket.rooms.values());
        for await (const roomName of rooms) {
            // Each socket joins a room equally its id
            if (roomName === socket.id) continue;

            const roomSize = io.sockets.adapter.rooms.get(roomName)?.size || 0;
            if (roomSize <= 0) {
                continue;
            }

            if (isSocketRoomAdmin(socket, roomName)) {
                const roomMeta = socket.data[roomName]._meta!;
                // If admin leaves room, transfer admin to next user
                await transferAdminMetadataToNewUserInRoom(io, roomName, roomMeta);
            }

            socket.leave(roomName);
            await notifyRoomForUpdatedUserStates(io, roomName, "user-left");
        }
    });
}