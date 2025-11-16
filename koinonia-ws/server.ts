import { redisSub } from './redis'
import { Server } from 'socket.io'

let io: Server | null = null;

export function getIO() {
  if (!io) throw new Error("Socket server not initialized yet.");
  return io;
}


export function initSocket(server: any) {
    if (io) return io;
    io = new Server(server, { cors: { origin: "*" } })

    redisSub.subscribe("user_status", (message) => {
        const data = JSON.parse(message)
        io!.emit("user-status-update", data)
    })

    io.on("connection", (socket) => {
        console.log("User connected: ", socket.id)
    })

    return io
}