"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
/* eslint-disable import/no-cycle */
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const express_session_1 = __importDefault(require("express-session"));
const http_1 = __importDefault(require("http"));
const v1_1 = require("./resources/v1");
const session_file_store_1 = __importDefault(require("session-file-store"));
const FileStoreStore = (0, session_file_store_1.default)(express_session_1.default);
// const redisClient = createClient({
//   username: process.env.REDIS_USERNAME,
//   password: process.env.REDIS_SECRET,
//   socket: {
//     host: process.env.REDIS_HOST,
//     port: Number(process.env.REDIS_PORT)
//   }
// });
// redisClient.connect().catch(console.error);
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = 4090;
// Increase JSON payload limit
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
const corsOptions = {
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:3005",
        "http://localhost:3006",
        "http://localhost:3007",
        "http://localhost:3008",
        "http://localhost:3009",
        "https://vercel.app",
        " auth-test-xvk7-git-main-andreas-projects-1f8252d2.vercel.app",
        "auth-test-xvk7-i0d6as54v-andreas-projects-1f8252d2.vercel.app",
        "https://auth-test-xvk7.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
};
// redisClient.on('error', (err) => console.log('Redis Client Error', err));
// // Create Redis store
// const RedisStore = connectRedis(session);
exports.io = new socket_io_1.Server(server, {
    maxHttpBufferSize: 5e8, // Increases buffer size to ~500MB
    cors: corsOptions
});
exports.io.on("connection", (socket) => {
    console.log(`client connected from IO Socket: ${socket.id}`);
    socket.on("disconnect", (reason) => {
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
app.use((0, express_session_1.default)({
    name: "siwe",
    secret: "siwe",
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: false,
        sameSite: 'none',
        secure: true,
    },
}));
app.use((0, cors_1.default)(corsOptions));
app.use("/api/v1/auth/", v1_1.authRouter);
server.listen(PORT, () => {
    console.log("App listening on port:", PORT);
});
exports.default = app;
//# sourceMappingURL=index.js.map