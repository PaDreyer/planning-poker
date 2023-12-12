/*
socket.on(
        "create-room",
        (roomSettings: RoomSettings, cb: ClientCallback) =>
            chain<[SocketServer, Socket, RoomSettings, ClientCallback]>(
                payloadValidationChain(RoomSettingsValidation),
                mapDataToSocketChain((socket: Socket, payload) => {
                    const {
                        roomId,
                        possiblePriorities,
                        possibleWeights,
                    } = payload;

                    socket.data[roomId] = {
                        isAdmin: true,
                        name: undefined,
                        voted: false,
                        weight: null,
                        priority: null,
                        _meta: {
                            revealed: false,
                            name: undefined,
                            possiblePriorities: possiblePriorities ?? [1,2,3],
                            possibleWeights: possibleWeights ?? [1,2,5,13,21,34],
                        }
                    };
                }),
                joinRoomChain(),
                sendResponseChain({ message: 'Created room', success: true }),
            )(io, socket, roomSettings, cb)
    );

    socket.on(
        "join-room",
        async (joinOptions: JoinOptions, cb: ClientCallback) =>
            chain<[SocketServer, Socket, JoinOptions, ClientCallback]>(
                payloadValidationChain(JoinOptionsValidation),
                mapDataToSocketChain((socket: Socket, payload) => {
                    const { roomId, name } = payload;

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
                }),
                joinRoomChain(),
                sendResponseChain({ message: 'Joined room', success: true }),
                notifyRoomMemberChain(),
            )(io, socket, joinOptions, cb)
    )

    socket.on(
        "vote",
        async (voteOptions: VoteOptions, cb: ClientCallback) =>
            chain<[SocketServer, Socket, VoteOptions, ClientCallback]>(
                payloadValidationChain(VoteOptionsValidation),
                verifyIsRoomMemberChain(),
                ensureRoomIsNotRevealedChain(),
                validateAllowedVoteValuesChain(),
                mapDataToSocketChain((socket: Socket, payload) => {
                    const { roomId, weight, priority } = payload;

                    socket.data[roomId].voted = true;
                    socket.data[roomId].weight = weight;
                    socket.data[roomId].priority = priority;
                }),
                notifyRoomMemberChain(),
                sendResponseChain({ message: 'Voted', success: true }),
            )(io, socket, voteOptions, cb)
    )

    socket.on(
        "reveal",
        async (revealOptions: RevealOptions, cb: ClientCallback) =>
            chain<[SocketServer, Socket, RevealOptions, ClientCallback]>(
                payloadValidationChain(RevealOptionsValidation),
                verifyIsRoomMemberChain(),
                ensureMemberIsAdminChain(),
                ensureAllMemberVotedChain(),
                mapDataToSocketChain((socket: Socket, payload) => {
                    const { roomId } = payload;
                    socket.data[roomId]._meta!.revealed = true;
                }),
                notifyRoomMemberChain(),
                sendResponseChain({ message: 'Revealed', success: true }),
            )(io, socket, revealOptions, cb)
    )

    socket.on(
        "reset",
        async (resetOptions: ResetOptions, cb: ClientCallback) =>
            chain<[SocketServer, Socket, ResetOptions, ClientCallback]>(
                payloadValidationChain(ResetOptionsValidation),
                verifyIsRoomMemberChain(),
                ensureMemberIsAdminChain(),
                resetDataOfSocketsInRoomChain(),
                notifyRoomMemberChain(),
                sendResponseChain({ message: 'Reset', success: true }),
            )(io, socket, resetOptions, cb)
    )

    // Disconnect socket from all rooms and ensure room admin
    socket.on("disconnect", async () => {
        const rooms = Array.from(socket.rooms.values());
        for (const roomName of rooms) {
            socket.leave(roomName);
            await notifyRoomForUpdatedUserStates(io, roomName);
        }
        console.log('Socket disconnected');
    });
 */