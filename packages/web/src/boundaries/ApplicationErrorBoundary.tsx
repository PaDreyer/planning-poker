import { useRouteError } from 'react-router-dom';

export function ApplicationErrorBoundary() {
    let error = useRouteError();
    console.error(error);

    return <div>
        <h3>Ouh...!</h3>
        <p>Something went wrong.</p>
    </div>
}