import http from "http";
import process from "process";
import { Server } from "socket.io";
import app from "./app.js";
import connectDatabase from "./config/database.js";
import { createCorsOptions, env } from "./config/index.js";
import registerSocketHandlers from "./socket/index.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    ...createCorsOptions(),
    methods: ["GET", "POST", "PATCH", "DELETE"],
    transports: ["websocket", "polling"],
  },
});

registerSocketHandlers(io);

const startServer = async () => {
  try {
    await connectDatabase();
    server.listen(env.PORT, () => {
      console.log(`Quizzatak API listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
