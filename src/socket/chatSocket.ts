import { Server, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const chatSocket = (io: Server) => {
    io.on("connection", async (socket: Socket) => {
        try {
            const token = socket.handshake.query.token as string;
console.log(token,"token")
            if (!token) {
                console.log("No token provided");
                socket.disconnect();
                return;
            }
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
         
            const userId = parseInt(decoded.userId);
            socket.data.userId = userId;

            socket.join(`user_${userId}`);
            console.log(`User ${userId} connected and joined room user_${userId}`);


            socket.on("send_message", async (data) => {
            

                const { chat_type, message_to, group_id, message } = data;

                if (chat_type === 0) {
                    console.log(` Sending individual message from ${userId} → ${message_to}`);

                    const msg = await prisma.individualMessage.create({
                        data: {
                            senderId: userId,
                            receiverId: parseInt(message_to),
                            message,
                        },
                    });


                    io.to(`user_${message_to}`).emit("receive_message", msg);
                } else if (chat_type === 1) {
                    console.log(`👥 Sending group message to group ${group_id}`);

                    const msg = await prisma.groupMessage.create({
                        data: {
                            senderId: userId,
                            groupId: parseInt(group_id),
                            message,
                        },
                    });

                    const members = await prisma.groupMember.findMany({
                        where: { groupId: parseInt(group_id) },
                    });

                    members.forEach((m) => {
                        console.log(` Emitting to user_${m.userId}`);
                        io.to(`user_${m.userId}`).emit("receive_group_message", msg);
                    });
                } else {
                    console.log(" Unknown chat_type received:", chat_type);
                }
            });

            socket.on("disconnect", () => {
                console.log(` User ${userId} disconnected`);
            });
        } catch (err) {
            console.log(" Socket error:", err);
            socket.disconnect();
        }
    });
};

export default chatSocket;
export { chatSocket };
