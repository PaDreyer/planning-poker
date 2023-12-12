export interface ChainFn<A extends Array<unknown>> {
    (...args: A): Promise<boolean> | boolean;
}

export function chain<A extends Array<unknown>>(...chainFns: Array<ChainFn<A>>) {
    return async (...fnArgs: A) => {
        let proceed = true;

        for await (const fn of chainFns) {
            if (!proceed) break;

            proceed = await Promise.resolve(fn(...fnArgs));
        }

        return proceed;
    }
}