// server.js
import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http"; 
import connectDB from "./database/db.js";
import { setupSocket } from "./socket/socket.js";

import authRouter from "./routes/auth.routes.js";
import examRouter from "./routes/exam.routes.js";
import dashboardRouter from "./routes/teacher.routes.js";

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

connectDB();

//Create HTTP server for Socket.io
const server = http.createServer(app);

//Initialize Socket.io with that HTTP server
setupSocket(server);

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/exams", examRouter);
app.use("/api/v1/teacher", dashboardRouter);




server.listen(port, () => {
    console.log(`🚀 Server listening on PORT ${port}`);
});
