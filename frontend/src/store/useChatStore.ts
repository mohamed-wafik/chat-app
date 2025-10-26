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
  read?: boolean;
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
    const { socket } = useAuthStore.getState();
    if (!socket) return;

    socket.on("newMessage", async (newMessage: IMessage) => {
      const audio = new Audio("/sound/notification.mp3");
      audio.currentTime = 0;
      audio.play().catch((err) => {
        console.warn("Audio blocked until user interacts:", err);
      });

      const { selectedUser } = get();

      if (selectedUser && newMessage.senderId === selectedUser._id) {
        set({ messages: [...get().messages, { ...newMessage, read: true }] });
        try {
          await axiosInstance.post(`/messages/read/${newMessage.senderId}`);
        } catch (err) {
          console.warn("Failed to mark messages read:", err);
        }
        // ensure local unread count is reset
        set({
          users: get().users.map((u) =>
            u._id === newMessage.senderId ? { ...u, unreadCount: 0 } : u
          ),
        });
        return;
      }

      set({
        users: get().users.map((u) =>
          u._id === newMessage.senderId
            ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
            : u
        ),
      });
    });

    // Listen for server notification when messages have been read by the other user
    socket.on(
      "messagesRead",
      (data: { senderId: string; receiverId: string }) => {
        // server emits to the original sender when their messages have been read
        const { receiverId } = data;
        set({
          users: get().users.map((u) =>
            u._id === receiverId ? { ...u, unreadCount: 0 } : u
          ),
        });
      }
    );
  },
  unsubscribeFromNewMessages: () => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.off("newMessage");
      socket.off("messagesRead");
    }
  },
  setSelectedUser: (user) => {
    set({ selectedUser: user });
    if (user && user._id) {
      axiosInstance
        .post(`/messages/read/${user._id}`)
        .then(() => {
          set({
            users: get().users.map((u) =>
              u._id === user._id ? { ...u, unreadCount: 0 } : u
            ),
          });
        })
        .catch((err) => {
          console.warn("Failed to mark messages read:", err);
        });
    }
  },
}));
