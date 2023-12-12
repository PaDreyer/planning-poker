import * as z from "zod";

/*####################### Basic Validation #######################*/
const roomIdValidation = z.string()
    .min(10)
    .max(64);

const nameValidation = z.string()
    .min(3)
    .max(15);

const weightValidation = z.number().max(Number.MAX_SAFE_INTEGER);
const priorityValidation = z.number().max(Number.MAX_SAFE_INTEGER);


/*####################### Payload Validation #######################*/
export const CreateOptionsValidation = z.object({
    roomId: roomIdValidation,
    name: nameValidation
        .optional(),
    possibleWeights: z.array(weightValidation)
        .min(2)
        .max(10)
        .optional(),
    possiblePriorities: z.array(priorityValidation)
        .min(1)
        .max(15)
        .optional(),
});

export const JoinOptionsValidation = z.object({
    roomId: roomIdValidation,
    name: nameValidation,
});

export const VoteOptionsValidation = z.object({
    roomId: roomIdValidation,
    weight: weightValidation,
    priority: priorityValidation,
});

export const RevealOptionsValidation = z.object({
    roomId: roomIdValidation,
});

export const ResetOptionsValidation = z.object({
    roomId: roomIdValidation,
});

export const LeaveOptionsValidation = z.object({
    roomId: roomIdValidation,
});


