import { createServer } from 'http';
import { createWebsocketServer } from "./websocket";
import { createExpressServer } from "./server";

const PORT = process.env.PORT || 8080;

const app = createExpressServer();
const server = createServer(app);
createWebsocketServer(server);

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});