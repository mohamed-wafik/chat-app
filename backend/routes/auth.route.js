import express from "express";
import {
  checkAuth,
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
const router = express.Router();
export default router;

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.put("/updata-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);
