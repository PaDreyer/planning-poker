import express = require('express');
import type { Application } from "express";

export function createExpressServer(): Application {
    const app = express();
    app.use("/public", express.static(`${__dirname}/public`, { index: false }));

    app.use("*", (req, res) => {
        res.sendFile(`${__dirname}/public/index.html`);
    });
    return app;
}