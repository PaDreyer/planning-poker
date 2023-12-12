import {
    Box,
    Button,
    Typography
} from "@mui/material";

type VoteMatrixProps = {
    label: string;
    possibleVotes: number[];
    setVote: (vote: number) => void;
    selectedVote?: number;
    disabled: boolean;
}

/**
 * Vote matrix
 * @param props
 * @constructor
 */
export function VoteMatrix(props: VoteMatrixProps) {
    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
        >
            <Typography variant={"h6"} fontWeight={600}>
                {props.label}
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    mb: 3,
                }}
            >
                {
                    props.possibleVotes.map((vote, index) => (
                        <Button
                            sx={{ m: .5, height: 50, width: 50 }}
                            key={index}
                            onClick={() => props.setVote(vote)}
                            variant={props.selectedVote === vote ? "contained" : "outlined"}
                            disabled={props.disabled}
                        >
                            {vote}
                        </Button>
                    ))
                }
            </Box>
        </Box>
    )
}