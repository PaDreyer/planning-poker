import React, { PropsWithChildren } from 'react';

type ErrorBoundaryProps = {}

type ErrorBoundaryState = {
    hasError: boolean;
    error: unknown;
}

export class RootErrorBoundary extends React.Component<
    PropsWithChildren<ErrorBoundaryProps>,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: undefined };
    }

    static getDerivedStateFromError(error: unknown) {
        return { hasError: true, error };
    }

    componentDidCatch(error: unknown, info: React.ErrorInfo) {
        console.error(error, info);
    }

    retry() {
        this.setState({ hasError: false, error: undefined });
    }

    render() {
        if (this.state.hasError) {
            return <div>
                <h3>What the hell...</h3>
                <h5>Your application absolutely blew up</h5>
                <button onClick={() => this.retry()}>Try it again</button>
            </div>
        }

        return this.props.children;
    }
}