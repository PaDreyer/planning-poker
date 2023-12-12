import React from 'react';
import ReactDOM from 'react-dom/client';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { App } from './app';
import { RootErrorBoundary } from "./boundaries/RootErrorBoundary";


let container = document.getElementById('root');
if (!container) {
    console.error(`Suspiciously, there is no root element in the document. Created one.`)
    container = document.createElement('div');
    document.body.appendChild(container);
}

const root = ReactDOM.createRoot(container);
root.render(
    <RootErrorBoundary>
        <App />
    </RootErrorBoundary>
);

