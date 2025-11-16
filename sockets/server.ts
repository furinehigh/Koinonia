import { redisSub } from '@/lib/redis'
import { Server } from 'socket.io'

export function initSocket(server: any) {
    const io = new Server(server, { cors: { origin: "*" } })

    redisSub.subscribe("user_status", (message) => {
        const data = JSON.parse(message)
        io.emit("user-status-update", data)
    })

    io.on("connection", (socket) => {
        console.log("User connected: ", socket.id)
    })

    return io
}