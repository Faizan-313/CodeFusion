import { Server } from "socket.io";
import registerStudentEvents from "./studentEvents.js";
import registerTeacherEvents from "./teacherEvents.js";

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("New client connected");

        // Handle room joining
        socket.on("joinRoom", ({ room }) => {
            socket.join(room);
            console.log(`Socket joined room: ${room}`);
        });

        // Register event handlers
        registerStudentEvents(io, socket);
        registerTeacherEvents(io, socket);

        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    });

    return io;
};