import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/AuthRoutes.js';
import messageRoutes from './routes/MessageRoutes.js';
import uploadRoutes from './routes/upload.js';
import { Server } from 'socket.io';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads/images', express.static('uploads/images'));
app.use('/uploads/recordings', express.static('uploads/recordings'));

app.use('/api/auth', authRoutes);

app.use('/api/message', messageRoutes);

app.use('/api/upload', uploadRoutes);


app.get('/health-status', (_req, res) => {
  res.send('Excellent');
});

const port = process.env.PORT || 3005;

const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

const socketOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3005',
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: socketOrigins,
    methods: ['GET', 'POST', 'PATCH'],
  },
});

global.onlineUsers = new Map();

io.on('connection', (socket) => {
  global.chatSocket = socket;

  socket.on('add-user', (userId) => {
    if (!userId) return;
    onlineUsers.set(userId, socket.id);
    io.emit('online-users', {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });

  socket.on('signout', (id) => {
    onlineUsers.delete(id);
    io.emit('online-users', {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });

  socket.on('disconnect', () => {
    let disconnectedUserId;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }

    if (disconnectedUserId) {
      onlineUsers.delete(disconnectedUserId);
      io.emit('online-users', {
        onlineUsers: Array.from(onlineUsers.keys()),
      });
    }
  });

  socket.on('send-msg', (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('msg-receiver', {
        from: data.from,
        message: data.message,
      });
    }
  });

  socket.on('outgoing-voice-call', (data) => {
    const sendUserSocket = onlineUsers.get(data.to);

    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('incoming-voice-call', {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

  socket.on('outgoing-video-call', (data) => {
    const sendUserSocket = onlineUsers.get(data.to);

    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('incoming-video-call', {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

  socket.on('reject-voice-call', (data) => {
    if (!data?.from) return;
    const sendUserSocket = onlineUsers.get(data.from);

    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('voice-call-rejected');
    }
  });

  socket.on('reject-video-call', (data) => {
    if (!data?.from) return;
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('video-call-rejected');
    }
  });

  socket.on('accept-incoming-call', ({ id }) => {
    const sendUserSocket = onlineUsers.get(id);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('accept-call');
    }
  });
});
