const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { initializeWebSocket } = require("./src/WebSocket");
// const router = require("./src/routes/Routes");
const rateLimit = require("express-rate-limit");
const { errorHandler } = require("./src/middlewares/errorHandler");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ server });

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
});

// Middleawares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1); // Trust the first proxy (ngrok/nginx)
app.use(limiter);

// Initializing Websocket Server
initializeWebSocket(wss);

// App router
// app.use("/", router);
app.use(errorHandler)

server.listen(port, () => {
  console.log(`Listening at Port ${port}`);
});
