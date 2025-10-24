import { create } from "zustand";
import axiosInstance from "../lib/axios";
import type { IFormDataLogin, IFormDataSignUp, IUser } from "../interface";
import toast from "react-hot-toast";
import axios from "axios";
import { io } from "socket.io-client";
interface AuthStore {
  user: IUser | null;
  onlineUsers: string[];
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  checkAuth: () => Promise<void>;
  signUp: (data: IFormDataSignUp) => Promise<void>;
  login: (data: IFormDataLogin) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<IUser>) => Promise<void>;
  socketConnected: () => void;
  socketDisconnected: () => void;
  socket?: ReturnType<typeof io> | null;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  socket: null,
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      get().socketConnected();
      set({ user: res.data.data });
    } catch {
      set({ user: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);
      toast.success("Account created successfully");
      get().socketConnected();
      set({ user: res.data.data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Something went wrong");
      } else {
        toast.error("Unexpected error occurred");
      }
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      toast.success("Logged in successfully");
      get().socketConnected();
      set({ user: res.data.data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Something went wrong");
      } else {
        toast.error("Unexpected error occurred");
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      toast.success("Logged out successfully");
      get().socketDisconnected();
      set({ user: null });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Something went wrong");
      } else {
        toast.error("Unexpected error occurred");
      }
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/updata-profile", data);
      toast.success("Profile updated successfully");
      set({ user: res.data.data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Something went wrong");
      } else {
        toast.error("Unexpected error occurred");
      }
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  socketConnected: () => {
    const { user, socket } = get();
    if (!user) return;

    if (socket?.connected) return;

    const socketInstance = io(
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3001",
      {
        query: { userId: user._id },
      }
    );

    set({ socket: socketInstance });
    socketInstance.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  socketDisconnected: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
      console.log("Socket manually disconnected");
      set({ socket: null });
      socket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds });
      });
    }
  },
}));
