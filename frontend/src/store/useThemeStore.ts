import { create } from "zustand";
interface ITheme {
  theme: string;
  setTheme: (theme: string) => void;
}
export const useThemeStore = create<ITheme>((set) => ({
  theme: localStorage.getItem("chat-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));
