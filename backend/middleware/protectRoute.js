import JWT from "jsonwebtoken";
import { asyncWrapper } from "./asyncWrapper.js";
import User from "../models/user.model.js";

export const protectRoute = asyncWrapper(async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(403).json({
      message: "Unauthorized: No token provided.",
      data: null,
      status: 403,
    });
  }

  const decoded = JWT.verify(token, process.env.JWT_SECRET);

  if (!decoded || !decoded.id) {
    return res.status(401).json({
      message: "Invalid token.",
      data: null,
      status: 401,
    });
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    return res.status(404).json({
      message: "User not found.",
      data: null,
      status: 404,
    });
  }

  req.user = user;
  next();
});
