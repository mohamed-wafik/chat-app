import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getMessages,
  getUsersForSidebar,
  markMessagesAsRead,
  sendMessage,
} from "../controllers/message.controller.js";
const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.post("/read/:id", protectRoute, markMessagesAsRead);
export default router;
