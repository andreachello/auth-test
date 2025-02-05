/* eslint-disable import/no-cycle */
import "dotenv/config";
import express from "express";
import cors from "cors";

import { Server } from "socket.io";
import path from 'path';
import Session from "express-session";
import http from "http";
import {
  authRouter,
} from "./resources/v1";

import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import FileStore from 'session-file-store'; 

const FileStoreStore = FileStore(Session);

const redisClient = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_SECRET,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
redisClient.connect().catch(console.error);

const app = express();
const server = http.createServer(app);

const PORT = 4090;

// Increase JSON payload limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));



// redisClient.on('error', (err) => console.log('Redis Client Error', err));

// // Create Redis store
// const RedisStore = connectRedis(session);

export const io = new Server(server, {
  maxHttpBufferSize: 5e8, // Increases buffer size to ~500MB
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket: any) => {
  console.log(`client connected from IO Socket: ${socket.id}`);

  socket.on("disconnect", (reason: any) => {
    console.log(`Client disconnected: ${reason}`);
  });
});

// app.use(
//   Session({
//     name: "siwe",
//     secret: "siwe",
//     resave: true,
//     saveUninitialized: true,
//     cookie: { secure: false, sameSite: true },
//     //   store: new FileStoreStore({
//     //     path: Path.resolve(__dirname, '../db/sessions'),
//     // }),
//   }),
// );

app.use(
  Session({
    name: "siwe",
    secret: "siwe",
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false, sameSite: "lax"
    },
  }),
);

const corsOptions = {
  origin: [""],
  credentials: true,
};


app.use(cors(corsOptions));


app.use("/api/v1/auth/", authRouter);

server.listen(PORT, () => {
  console.log("App listening on port:", PORT);
});

export default app;