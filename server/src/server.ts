import WebSocket, { WebSocketServer } from "ws";

const port: number = Number(process.env.PORT) || 8080;

const wss = new WebSocketServer({ port });
let activeClients: WebSocket[] = [];
console.clear();
wss.on("connection", (ws: WebSocket) => {
  // if (activeClients.length > 2) {
  //   ws.send("Server Full.");
  //   ws.close();
  //   return;
  // }
  activeClients.push(ws);
  console.log('Connected');

  ws.on("message", (message: string) => {
    activeClients.forEach((client: WebSocket) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
  ws.on("close", () => {
    activeClients = activeClients.filter(n => n !== ws);
    console.log('Client Disconnected.');
  });
});

console.log(`WebSocket server is running on ${process.env.URL || `ws://localhost:${process.env.PORT || 8080}`}.`);
