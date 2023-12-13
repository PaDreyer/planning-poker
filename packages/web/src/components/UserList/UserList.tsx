import { useMemo, useRef, useState } from 'react';
import { Box, Card, Grid, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import MoreVertIcon from '@mui/icons-material/MoreVert';


type UserData = {
    id: string;
    name: string;
    isAdmin: boolean;
    voted: boolean;
    priority: number | undefined;
    weight: number | undefined;
}

type UserListProps = {
    usedByAdmin: boolean;
    users: Array<UserData>;
    handleKick: (id: string) => void;
}

/**
 * List members and their votes
 * @param props UserListProps
 */
export function UserList(props: UserListProps) {
    const [
        contextMenuAnchorEl,
        setContextMenuAnchorEl
    ] = useState<null | HTMLElement>(null);
    const contextMenuOpen = Boolean(contextMenuAnchorEl);
    const contextMenuButtonRef = useRef<HTMLButtonElement>(null);
    const handleClose = () => {
        setContextMenuAnchorEl(null);
    }
    const handleOpen = () => {
        setContextMenuAnchorEl(contextMenuButtonRef.current);
    }

    const handleKick = (id: string) => {
        props.handleKick(id);
        handleClose();
    }

    const columns = props.usedByAdmin ? 15 : 12;
    const header = useMemo(() => {
        const header = ["Name", "Priority", "Weight", "Voted"];
        if (props.usedByAdmin) {
            header.push("Options");
        }
        return header;
    }, [props.usedByAdmin]);


    const responsiveTitle = {
        variant: {
            xs: "subtitle2",
            sm: "h6",
        }
    }

    return (
        <Box
            display={"flex"}
            sx={{ px: 1, mb: 9, mt: 2 }}
            alignItems={"center"}
            flexDirection={"column"}
            width={"100%"}
        >
            <Typography
                variant={"h4"}
                fontWeight={600}
                sx={{
                    mx: { xs: 1, sm: 0 },
                    my: 2,
                    alignSelf: "flex-start",
                }}
            >
                Member
            </Typography>
            <Grid container columns={columns} width={"100%"} rowSpacing={2} mt={1.5}>
                <Grid container columns={columns} px={1.5}>
                { header.map((title, idx, list) => (
                    <Grid
                        item
                        key={idx}
                        xs={3}
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={idx === 0 ? "flex-start" :
                            idx === list.length-1 ? "flex-end" : "center"
                        }
                    >
                        <Typography
                            fontWeight={600}
                            sx={responsiveTitle}
                        >
                            { title }
                        </Typography>
                    </Grid>
                ))}
                </Grid>
                { props.users.map((user, idx) => (
                    <Grid item xs={columns} sm={columns} md={columns}>
                        <Card key={idx} sx={{ py: 1, px: 2 }}>
                            <Grid container columns={columns} width={"100%"}>
                                <Grid item xs={3} display={"flex"} alignItems={"center"} justifyContent={"flex-start"}>
                                    <Typography fontWeight={500} sx={responsiveTitle}>
                                        {user.name}
                                    </Typography>
                                </Grid>
                                <Grid item xs={3} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                                    <Typography textAlign={"center"} sx={responsiveTitle}>
                                        {user.priority ?? "?"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={3} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                                    <Typography textAlign={"center"} sx={responsiveTitle}>
                                        {user.weight ?? "?"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={3} display={"flex"} alignItems={"center"} justifyContent={props.usedByAdmin ? "center": "flex-end"}>
                                    { user.voted ? <CheckIcon color={"success"} /> : <CloseIcon color={"error"} /> }
                                </Grid>
                                { props.usedByAdmin && (
                                    <Grid item xs={3} display={"flex"} alignItems={"center"} justifyContent={"flex-end"}>
                                        <IconButton
                                            sx={{ visibility: user.isAdmin ? "hidden" : "visible" }}
                                            id={"basic-button"}
                                            aria-controls={contextMenuOpen ? 'basic-menu' : undefined}
                                            aria-haspopup="true"
                                            aria-expanded={contextMenuOpen ? 'true' : undefined}
                                            ref={contextMenuButtonRef}
                                            onClick={handleOpen}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                        <Menu
                                            id="basic-menu"
                                            anchorEl={contextMenuAnchorEl}
                                            open={contextMenuOpen}
                                            onClose={handleClose}
                                            MenuListProps={{
                                                'aria-labelledby': 'basic-button',
                                            }}
                                        >
                                            <MenuItem onClick={() => handleKick(user.id)}>kick</MenuItem>
                                        </Menu>
                                    </Grid>
                                )}
                            </Grid>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}