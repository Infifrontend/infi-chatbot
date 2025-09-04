import React, { useEffect, useRef } from "react";
import { useAppSelector } from "../../hooks/useAppSelector";
import MessageItem from "../MessageItem/MessageItem";
import TypingIndicator from "../TypingIndicator/TypingIndicator";
import config from "../../config/config.json";
import "./MessageList.scss";

const MessageList: React.FC = () => {
  const { messages, isTyping } = useAppSelector((state) => state.chat);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isHalfScreenMode = config.displayView === "half";
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="cls-message-list">
      {messages.length === 0 ? (
        <div className="welcome-container">
          <div className="cls-welcome-content">
            <h1>
              {config.welcome_message || "Welcome to the Chat!"}
            </h1>
            <p
              className="cls-description"
            >
              {config.welcome_subtitle || "Welcome to the Chat!"}
            </p>
          </div>
        </div>
      ) : (
        <div className= {`messages-container ${isHalfScreenMode ? "cls-half-screen" : ""}`}>
          {messages.map((message: any) => (
            <MessageItem
              key={message.id}
              message={message}
              // isLastMessage={index === messages.length - 1}
            />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;
