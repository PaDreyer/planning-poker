import React from 'react';
import { Box, Card, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

type UserData = {
    name: string;
    isAdmin: boolean;
    voted: boolean;
    priority: number | undefined;
    weight: number | undefined;
}

type UserListProps = {
    users: Array<UserData>;
}

/**
 * List members and their votes
 * @param props
 * @constructor
 */
export function UserList(props: UserListProps) {
    return (
        <Box mx={3} mb={9} mt={2}>
            <Typography variant={"h4"} fontWeight={600} my={2}>
                Member
            </Typography>
            <Box
                display={"flex"}
                flexDirection={"row"}
                width={"100%"}
                px={1.5}
            >
                { ["Name", "Priority", "Weight", "Voted"].map((title, idx, list) => (
                    <Box
                        key={`${title}-${idx}`}
                        display={"flex"}
                        flexGrow={1}
                        justifyContent={idx === 0 ? "flex-start" : idx === list.length-1 ? "flex-end" : "center"}
                    >
                        <Typography variant={"h6"} fontWeight={600}>
                            {title}
                        </Typography>
                    </Box>
                ))}
            </Box>
            <Box>
                { props.users.map((user, idx) => (
                    <Card
                        key={`${user.name}-${idx}`}
                        sx={{
                            p: 1.5,
                            my: 2,
                            display: "flex",
                            flexDirection: "row",
                        }}
                    >
                        <Box
                            display={"flex"}
                            flexBasis={"100%"}
                            justifyContent={"flex-start"}
                            alignItems={"center"}
                        >
                            <Typography fontSize={20} fontWeight={500}>
                                {user.name}
                            </Typography>
                        </Box>

                        <Box
                            display={"flex"}
                            flexBasis={"100%"}
                            justifyContent={"center"}
                            alignItems={"center"}
                        >
                            <Typography>
                                {user.priority ?? "?"}
                            </Typography>
                        </Box>

                        <Box
                            display={"flex"}
                            flexBasis={"100%"}
                            justifyContent={"center"}
                            alignItems={"center"}
                        >
                            <Typography>
                                {user.weight ?? "?"}
                            </Typography>
                        </Box>

                        <Box
                            display={"flex"}
                            flexBasis={"100%"}
                            justifyContent={"flex-end"}
                            alignItems={"center"}
                        >
                            <Box
                                display={"flex"}
                                justifyContent={"flex-end"}
                            >
                                { user.voted ? <CheckIcon fontSize={"large"} color={"success"} /> : <CloseIcon fontSize={"large"} color={"error"} /> }
                            </Box>
                        </Box>
                    </Card>
                ))}
            </Box>
        </Box>
    )
}
