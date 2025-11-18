import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

type Room = {
  [roomId: string]: Set<WebSocket>;
};

const wss = new WebSocketServer({ port: 8080 });
const rooms: Room = {};

wss.on("connection", (mws) => {
  console.log("someone joined");
  let currentRoom: string | null = null;

  mws.on("message", (data) => {
    const msg = JSON.parse(data.toString());

    // join room
    if (msg.type === "join") {
      const { roomId } = msg;
      currentRoom = roomId;

      if (!rooms[roomId]) rooms[roomId] = new Set();
      rooms[roomId].add(mws);

      console.log(`Client joined room ${roomId}`);
      return;
    }

    if (msg.type === "msg") {
      const { message } = msg;

      console.log("HEY", message);
    }

    // relay offer / answer / ice candidate within room
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].forEach((client) => {
        if (client && mws) {
          client.send(JSON.stringify(msg));
        }
      });
    }
  });

  wss.on("close", () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].delete(mws);
    }
  });
});

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  }).listen(port);

  console.log("signaling server running on ws://localhost:8080");
});
