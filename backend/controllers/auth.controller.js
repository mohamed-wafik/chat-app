import { asyncWrapper } from "../middleware/asyncWrapper.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import generateJWT from "../utils/generatJWT.js";
import cloudinary from "../lib/cloudinary.js";
export const register = asyncWrapper(async (req, res, next) => {
  const { fullName, email, password } = req.body;

  const oldUser = await User.findOne({ email });

  if (oldUser) {
    return res.status(400).json({
      message: "User already exists",
      data: null,
      status: 400,
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ fullName, email, password: hashPassword });
  const savedUser = await newUser.save();

  generateJWT({ id: savedUser._id }, res);
  const { password: _, ...user } = savedUser.toObject();

  return res.status(201).json({
    data: user,
    message: "User created successfully!",
    status: 200,
  });
});

export const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
      status: 400,
      data: null,
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      status: 404,
      data: null,
    });
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(401).json({
      message: "Invalid credentials",
      status: 401,
      data: null,
    });
  }

  generateJWT({ id: user._id }, res);
  const { password: _, ...userRes } = user.toObject();

  return res.json({
    message: "Logged in successfully!",
    data: userRes,
    status: 200,
  });
});
export const logout = asyncWrapper(async (req, res, next) => {
  res.cookie("jwt", "", { maxAge: 0 });
  return res.json({
    data: null,
    message: "logged out successfully!",
    status: 200,
  });
});
export const updateProfile = asyncWrapper(async (req, res, next) => {
  const { profilePic } = req.body;
  const userId = req.user._id;

  if (!profilePic) {
    return res.status(400).json({
      message: "Profile picture is required.",
      status: 400,
    });
  }

  const uploadRes = await cloudinary.uploader.upload(profilePic);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { profilePic: uploadRes.secure_url },
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) {
    return res.status(401).json({
      message: "User not found.",
      status: 404,
    });
  }

  res.status(200).json({
    message: "Profile updated successfully.",
    status: 200,
    data: updatedUser,
  });
});
export const checkAuth = async (req, res, next) => {
  res.json({
    message: "User is authenticated",
    data: req.user,
    status: 200,
  });
};
