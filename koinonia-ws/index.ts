import { createServer } from "http";
import { initSocket } from "./server";

const httpServer = createServer();

initSocket(httpServer)

const port = process.env.PORT || 8080;
httpServer.listen(port, () => {
  console.log(`WebSocket server running on ${port}`);
});
