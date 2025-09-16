import getPrismaInstance from "../utils/PrismaClient.js";
import {generateToken04} from "../utils/TokenGenerator.js"

export const checkUser = async (req, res, next) => {
  try {
    const { email } = req.body;

    // console.log(email);

    if (!email) {
      return res.json({ msg: "Email is required.", status: false });
    }

    const prisma = getPrismaInstance();
    const user = await prisma.User.findUnique({ where: { email } });

    // console.log("user is", user);

    if (!user) {
      return res.json({ msg: "No user found", status: false });
    } else {
      return res.json({ msg: "User found", status: true, data: user });
    }
  } catch (error) {
    next(error);
  }
};

export const onBoardUser = async (req, res, next) => {
  try {
    const { name, email, image: profilePicture, about } = req.body;

    if (!name || !email) {
      return res.json({ msg: "Name and Email are required.", status: false });
    }

    const prisma = getPrismaInstance();
    const user = await prisma.User.create({
      data: {
        name,
        email,
        profilePicture,
        about,
      },
    });

    // console.log("new user is", user);

    return res.json({
      msg: "User created successfully",
      status: true,
      user: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const users = await prisma.User.findMany({
        orderBy:{name: 'asc'},
        select: { id: true, name: true, email: true, profilePicture: true, about: true }
    });

    const userGroupedByInitialLetter = {};
    users.forEach(user => {
      const initialLetter = user.name.charAt(0).toUpperCase();
        if (!userGroupedByInitialLetter[initialLetter]) {
            userGroupedByInitialLetter[initialLetter] = [];
        }
        userGroupedByInitialLetter[initialLetter].push(user);
    });

    // console.log("all users are", users);
    return res.json({ msg: "Users fetched successfully", status: true, users: userGroupedByInitialLetter });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id, name, about, profilePicture } = req.body;
    if (!id) {
      return res.json({ msg: "User ID is required.", status: false });
    }

    const prisma = getPrismaInstance();
    const user = await prisma.User.update({
      where: { id },
      data: {
        name,
        about,
        profilePicture,
      },
    });
    // console.log("updated user is", user);
    return res.json({ msg: "User updated successfully", status: true, user });
  } catch (error) {
    next(error);
  }
};

export const generateToken = (req, res, next) => {
  try {
    const appId = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_ID;
    const userId = req.params.userId;
    const effectiveTime = 3600;
    const payload = "";
    if(appId && serverSecret && userId) {
      const token = generateToken04(appId, userId, serverSecret, effectiveTime, payload);
      return res.status(200).json({ token });
    }
    return res.status(400).send('userid, sserver secret, appid is required.');

  } catch (error) {
    next(error)
  }
}