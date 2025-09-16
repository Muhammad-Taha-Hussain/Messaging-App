import { log } from "console";
import getPrismaInstance from "../utils/PrismaClient.js";
import { renameSync } from "fs";

export const addMessage = async (req, res) => {
  try {
    const { from, to, message } = req.body;

    const prisma = getPrismaInstance();
    const getUser = onlineUsers.get(to);
    if (message && from && to) {
      const newMessage = await prisma.Messages.create({
        data: {
          message,
          sender: { connect: { id: parseInt(from) } },
          receiver: { connect: { id: parseInt(to) } },
          messageStatus: getUser ? "delivered" : "sent",
        },
        include: { sender: true, receiver: true },
      });
      return res.status(201).send({ message: newMessage });
    }
    return res.status(400).send("From to and message is required");
  } catch (error) {
    console.error("Error adding message:", error);
    return res
      .status(500)
      .json({ msg: "Internal server error", status: false });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { from, to } = req.params;
    const prisma = getPrismaInstance();
    const messages = await prisma.Messages.findMany({
      where: {
        OR: [
          {
            senderId: parseInt(from),
            receiverId: parseInt(to),
          },
          {
            senderId: parseInt(to),
            receiverId: parseInt(from),
          },
        ],
      },
      orderBy: {
        id: "asc",
      },
    });

    const unreadMessages = [];

    messages.forEach((message, index) => {
      if (
        message.messageStatus !== "read" &&
        message.senderId === parseInt(to)
      ) {
        messages[index].messageStatus = "read";
        unreadMessages.push(message.id);
      }
    });

    await prisma.Messages.updateMany({
      where: {
        id: { in: unreadMessages },
      },
      data: {
        messageStatus: "read",
      },
    });
    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res
      .status(500)
      .json({ msg: "Internal server error", status: false });
  }
};

export const addImageMessage = async (req, res, next) => {
  try {
    if (req.file) {
      const date = Date.now();
      let fileName = "uploads/images/" + date + req.file.originalname;
      renameSync(req.file.path, fileName);
      const prisma = getPrismaInstance();
      // const getUser = onlineUsers.get(to);
      const { from, to } = req.query;
      if (from && to) {
        const message = await prisma.Messages.create({
          data: {
            message: fileName,
            type: "image",
            sender: { connect: { id: parseInt(from) } },
            receiver: { connect: { id: parseInt(to) } },
            // messageStatus: getUser ? "delivered" : "sent",
          },
        });
        return res.status(201).json({ message });
      }
      return res.status(400).json("from, to is required.");
    }
    return res.status(400).json("Image is required.");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const addAudioMessage = async (req, res, next) => {
  try {
    if (req.file) {
      const date = Date.now();
      let fileName = "uploads/recordings/" + date + req.file.originalname;
      renameSync(req.file.path, fileName);
      const prisma = getPrismaInstance();
      // const getUser = onlineUsers.get(to);
      const { from, to } = req.query;
      if (from && to) {
        const message = await prisma.Messages.create({
          data: {
            message: fileName,
            type: "audio",
            sender: { connect: { id: parseInt(from) } },
            receiver: { connect: { id: parseInt(to) } },
            // messageStatus: getUser ? "delivered" : "sent",
          },
        });
        return res.status(201).json({ message });
      }
      return res.status(400).json("from, to is required.");
    }
    return res.status(400).json("Audio is required.");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getInitialContactsWithMessages = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.from);
    const prisma = getPrismaInstance();

    // 1. Fetch only sender/receiver IDs in messages
    const user = await prisma.User.findUnique({
      where: { id: userId },
      select: {
        id: true,
        sentMessages: {
          take: 50,
          select: {
            id: true,
            type: true,
            message: true,
            messageStatus: true,
            createdAt: true,
            senderId: true,
            receiverId: true,
          },
          orderBy: { createdAt: "desc" },
        },
        receivedMessages: {
          take: 50,
          select: {
            id: true,
            type: true,
            message: true,
            messageStatus: true,
            createdAt: true,
            senderId: true,
            receiverId: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Merge messages & sort
    const messages = [...user.sentMessages, ...user.receivedMessages];
    messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // 3. Collect all unique user IDs involved
    const userIds = new Set();
    messages.forEach((m) => {
      userIds.add(m.senderId);
      userIds.add(m.receiverId);
    });

    // 4. Fetch users once
    const relatedUsers = await prisma.User.findMany({
      where: { id: { in: [...userIds] } },
      select: { id: true, name: true, profilePicture: true },
    });

    const userMap = new Map(relatedUsers.map((u) => [u.id, u]));

    // 5. Build contacts list
    const users = new Map();
    const messageStatusChange = [];

    messages.forEach((msg) => {
      const isSender = msg.senderId === userId;
      const calculatedId = isSender ? msg.receiverId : msg.senderId;

      if (msg.messageStatus === "sent") {
        messageStatusChange.push(msg.id);
      }

      const { id, type, message, messageStatus, createdAt, senderId, receiverId } = msg;

      if (!users.get(calculatedId)) {
        let userObj = {
          messageId: id,
          type,
          message,
          messageStatus,
          createdAt,
          senderId,
          receiverId,
        };

        if (isSender) {
          userObj = {
            ...userObj,
            ...userMap.get(receiverId),
            totalUnreadMessages: 0,
          };
        } else {
          userObj = {
            ...userObj,
            ...userMap.get(senderId),
            totalUnreadMessages: messageStatus !== "read" ? 1 : 0,
          };
        }
        users.set(calculatedId, { ...userObj });
      } else if (messageStatus !== "read" && !isSender) {
        const existingUser = users.get(calculatedId);
        users.set(calculatedId, {
          ...existingUser,
          totalUnreadMessages: existingUser.totalUnreadMessages + 1,
        });
      }
    });

    // 6. Update delivered messages
    if (messageStatusChange.length) {
      await prisma.Messages.updateMany({
        where: { id: { in: messageStatusChange } },
        data: { messageStatus: "delivered" },
      });
    }

    return res.status(200).json({
      users: Array.from(users.values()),
      onlineUsers: Array.from(onlineUsers.keys()), // assuming you have this global
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


// export const getInitialContactsWithMessages = async (req, res, next) => {
//   try {
//     const userId = parseInt(req.params.from);
//     const prisma = getPrismaInstance();

//     // const user = await prisma.User.findUnique({
//     //   where: { id: userId },
//     //   include: {
//     //     sentMessages: {
//     //       take: 50,
//     //       include: {
//     //         receiver: true,
//     //         sender: true,
//     //       },
//     //       orderBy: {
//     //         createdAt: "desc",
//     //       },
//     //     },
//     //     receivedMessages: {
//     //       take: 50,
//     //       include: {
//     //         receiver: true,
//     //         sender: true,
//     //       },
//     //       orderBy: {
//     //         createdAt: "desc",
//     //       },
//     //     },
//     //   },
//     // });

//     const user = await prisma.User.findUnique({
//       where: { id: userId },
//       include: {
//         sentMessages: {
//           take: 3,
//           include: {
//             receiver: { select: { id: true, username: true, profilePicture: true } },
//             sender: { select: { id: true, username: true, profilePicture: true } },
//           },
//           orderBy: { createdAt: "desc" },
//         },
//         receivedMessages: {
//           take: 3,
//           include: {
//             receiver: { select: { id: true, username: true, profilePicture: true } },
//             sender: { select: { id: true, username: true, profilePicture: true } },
//           },
//           orderBy: { createdAt: "desc" },
//         },
//       },
//     });

//     const messages = [...user.sentMessages, ...user.receivedMessages];
//     messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

//     const users = new Map();
//     const messageStatusChange = [];

//     messages.forEach((msg) => {
//       const isSender = msg.senderId === userId;
//       const calculatedId = isSender ? msg.receiverId : msg.senderId;
//       if (msg.messageStatus === "sent") {
//         messageStatusChange.push(msg.id);
//       }
//       const {
//         id,
//         type,
//         message,
//         messageStatus,
//         createdAt,
//         senderId,
//         receiverId,
//       } = msg;
//       if (!users.get(calculatedId)) {
//         let user = {
//           messageId: id,
//           type,
//           message,
//           messageStatus,
//           createdAt,
//           senderId,
//           receiverId,
//         };
//         if (isSender) {
//           user = {
//             ...user,
//             ...msg.receiver,
//             totalUnreadMessages: 0,
//           };
//         } else {
//           user = {
//             ...user,
//             ...msg.sender,
//             totalUnreadMessages: messageStatus !== "read" ? 1 : 0,
//           };
//         }
//         users.set(calculatedId, { ...user });
//       } else if (messageStatus !== "read" && !isSender) {
//         const user = users.get(calculatedId);
//         users.set(calculatedId, {
//           ...user,
//           totalUnreadMessages: user.totalUnreadMessages + 1,
//         });
//       }
//     });
//     if (messageStatusChange.length) {
//       await prisma.Messages.updateMany({
//         where: {
//           id: { in: messageStatusChange },
//         },
//         data: {
//           messageStatus: "delivered",
//         },
//       });
//     }
//     return res.status(200).json({
//       users: Array.from(users.values()),
//       onlineUsers: Array.from(onlineUsers.keys()),
//     });
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };
