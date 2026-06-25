import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/AuthRoutes.js";
import messageRoutes from "./routes/MessageRoutes.js";
import uploadRoutes from "./routes/upload.js"
import { Server } from "socket.io";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads/images", express.static("uploads/images"));
app.use("/uploads/recordings", express.static("uploads/recordings"));

app.use("/api/auth", authRoutes);

app.use("/api/message", messageRoutes);

app.use("/api/upload", uploadRoutes);


app.get("/health-status", (req, res) => {
  try {

    res.send("Excellent");
  } catch (error) {
    next(error)
  }
});

const port = process.env.PORT || 3005;

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${port}`);
});

const io = new Server(server, {
  cors: {
    origin: ['https://2a50-157-10-227-35.ngrok-free.app', process.env.FRONTEND_URL, "http://localhost:3000"],
    methods: ["GET", "POST", "PATCH"],
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    console.log("Adding user:", userId, "with socket:", socket.id);
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys())
    })
  });

  socket.on("signout", (id) => {
    onlineUsers.delete(id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys())
    })
  })

  socket.on("send-msg", (data) => {
    // console.log(data.to);

    // console.log(onlineUsers);

    const sendUserSocket = onlineUsers.get(data.to);
    console.log("here is the receiver", sendUserSocket, data.message);

    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-receiver", {
        from: data.from,
        message: data.message,
      });
    }
  });

  socket.on("outgoing-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    console.log("here is the receiver in outgoing voice", sendUserSocket, data);

    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-voice-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

  socket.on("outgoing-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    console.log("here is the receiver", sendUserSocket, data);

    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-video-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

  socket.on("reject-voice-call", (data) => {
    console.log(data);
    
    const sendUserSocket = onlineUsers.get(data.from);
    console.log('reject voice call', sendUserSocket);
    
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("voice-call-rejected");
    }
  });

  socket.on("reject-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from

    );
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("video-call-rejected");
    }
  });

  socket.on("accept-incoming-call", ({ id }) => {
    const sendUserSocket = onlineUsers.get(id);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("accept-call");
    }
  });
});
