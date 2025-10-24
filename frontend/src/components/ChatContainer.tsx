import { use, useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    getMessages,
    selectedUser,
    messages,
    isMessagesLoading,
    subscribeToNewMessages,
    unsubscribeFromNewMessages,
  } = useChatStore();
  const { user } = useAuthStore();
  const messageEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    getMessages(selectedUser?._id as string);
    subscribeToNewMessages();
    return () => {
      unsubscribeFromNewMessages();
    };
  }, [
    getMessages,
    selectedUser?._id,
    subscribeToNewMessages,
    unsubscribeFromNewMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages)
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isMessagesLoading) return <MessageSkeleton />;
  console.log(messages);
  const renderMessage = messages.map((message) => (
    <div
      key={message._id}
      className={`chat ${
        message.senderId === user?._id ? "chat-end" : "chat-start"
      }`}
      ref={messageEndRef}
    >
      <div className=" chat-image avatar">
        <div className="size-10 rounded-full border">
          <img
            src={
              message.senderId === user?._id
                ? user.profilePic || "/avatar.png"
                : selectedUser?.profilePic || "/avatar.png"
            }
            alt="profile pic"
          />
        </div>
      </div>
      <div className="chat-header mb-1">
        <time className="text-xs opacity-50 ml-1">
          {formatMessageTime(message.createdAt)}
        </time>
      </div>
      <div className="chat-bubble flex flex-col">
        {message.image && (
          <img
            src={message.image}
            alt="Attachment"
            className="sm:max-w-[200px] rounded-md mb-2"
          />
        )}
        {message.text && <p>{message.text}</p>}
      </div>
    </div>
  ));
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {renderMessage}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
