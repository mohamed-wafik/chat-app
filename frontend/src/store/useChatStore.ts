import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import axios from "axios";
import type { IUser } from "../interface";
import { useAuthStore } from "./useAuthStore";

interface IMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: string;
  __v: number;
}

interface ChatStore {
  messages: IMessage[];
  users: IUser[];
  selectedUser: IUser | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;

  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  setSelectedUser: (user: IUser | null) => void;
  sendMessage: (messageData: {
    image: string | null;
    text?: string;
  }) => Promise<void>;
  subscribeToNewMessages: () => void;
  unsubscribeFromNewMessages: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      console.log(res.data.data);
      set({ users: res.data.data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to fetch users");
      } else {
        toast.error("Unexpected error occurred");
      }
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data.data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to load messages");
      } else {
        toast.error("Unexpected error occurred");
      }
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser?._id}`,
        messageData
      );
      set({ messages: [...messages, res.data.data] });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to load messages");
      } else {
        toast.error("Unexpected error occurred");
      }
    }
  },
  subscribeToNewMessages: () => {
    const { selectedUser } = get();
    const { socket } = useAuthStore.getState();
    if (!selectedUser || !socket) return;

    socket.on("newMessage", (newMessage: IMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;

      if (!isMessageSentFromSelectedUser) return;

      const audio = new Audio("/sound/notification.mp3");
      audio.currentTime = 0;
      audio.play().catch((err) => {
        console.warn("Audio blocked until user interacts:", err);
      });

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },
  unsubscribeFromNewMessages: () => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.off("newMessage");
    }
  },
  setSelectedUser: (user) => set({ selectedUser: user }),
}));
