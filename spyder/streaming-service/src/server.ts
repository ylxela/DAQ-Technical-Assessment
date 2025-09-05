import net from "net";
import internal from "stream";
import { WebSocket, WebSocketServer } from "ws";

interface VehicleData {
  battery_temperature: number | string;
  timestamp: number;
}

const TCP_PORT = 12000;
const WS_PORT = 8080;
const tcpServer = net.createServer();
const websocketServer = new WebSocketServer({ port: WS_PORT });

const errorMessager = (errorMessage: string) => {
  websocketServer.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({error: errorMessage}));
    }
  });
};

tcpServer.on("connection", (socket) => {
  console.log("TCP client connected");

  let count: number[] = [];

  socket.on("data", (msg) => {

    websocketServer.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({connect: "true" }));
      }
    });

    const message: string = msg.toString();
    console.log(`Received: ${message}`);

    const data = JSON.parse(message);

    if (typeof data.battery_temperature !== 'number' || isNaN(data.battery_temperature)) {
      console.error("Invalid battery Temperature: ", data.battery_temperature);
      errorMessager("Invalid battery Temperature");
      return;
    } else {
      if (data.battery_temperature < 20 || data.battery_temperature > 80) {
        console.error("Out of range");
        errorMessager("Out of range");
        count.push(data.timestamp)
      }

      count = count.filter(ts => Date.now() - ts <= 5000);

      if (count.length > 3) {
        console.error("Battery temperature out of safe range more than 3 times in 5 seconds.");
        errorMessager("Battery temperature out of safe range more than 3 times in 5 seconds.");
      }
        // Send JSON over WS to frontend clients
      websocketServer.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }

  });

  socket.on("end", () => {
    console.log("Closing connection with the TCP client");

    websocketServer.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({connect: "false" }));
      }
    });
  });

  socket.on("error", (err) => {
    console.log("TCP client error: ", err);
  });
});

websocketServer.on("listening", () =>
  console.log(`Websocket server started on port ${WS_PORT}`)
);

websocketServer.on("connection", async (ws: WebSocket) => {
  console.log("Frontend websocket client connected");
  ws.on("error", console.error);
});

tcpServer.listen(TCP_PORT, () => {
  console.log(`TCP server listening on port ${TCP_PORT}`);
});
