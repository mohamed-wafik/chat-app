import { asyncWrapper } from "../middleware/asyncWrapper.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";
import { getRecevierSocketId } from "../lib/socket.js";
export const getUsersForSidebar = asyncWrapper(async (req, res, next) => {
  const loggedInUserId = req.user._id;
  const fitleredUsers = await User.find({
    _id: { $ne: loggedInUserId },
  }).select("-password");
  return res.json({
    data: fitleredUsers,
    message: "get User For Sidebar Successfully!",
    status: 200,
  });
});
export const getMessages = asyncWrapper(async (req, res, next) => {
  const loggedInUserId = req.user._id;
  const { id: receiverId } = req.params;

  const messages = await Message.find({
    $or: [
      { senderId: loggedInUserId, receiverId },
      { senderId: receiverId, receiverId: loggedInUserId },
    ],
  }).sort({ createdAt: 1 });

  return res.status(200).json({
    data: messages,
    message: "Fetched messages successfully!",
    status: 200,
  });
});
export const sendMessage = asyncWrapper(async (req, res, next) => {
  const { text, image } = req.body;
  const loggedInUserId = req.user._id;
  const { id: receiverId } = req.params;

  if (!text && !image) {
    return res.status(400).json({
      message: "Message text or image is required.",
      status: 400,
      data: null,
    });
  }

  let imageUrl;
  if (image) {
    const uploadRes = await cloudinary.uploader.upload(image);
    imageUrl = uploadRes.secure_url;
  }

  const newMessage = new Message({
    senderId: loggedInUserId,
    receiverId,
    text,
    image: imageUrl || null,
  });

  const savedMessage = await newMessage.save();

  const receiverIdSocketId = getRecevierSocketId(receiverId);
  if (receiverIdSocketId) {
    io.to(receiverIdSocketId).emit("newMessage", savedMessage);
  }

  return res.status(201).json({
    data: savedMessage,
    message: "Message sent successfully!",
    status: 201,
  });
});
