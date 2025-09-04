import React, { useCallback, useState, useRef, useEffect } from "react";
import { ConfigProvider, theme as antTheme, Button } from "antd";
import {
  PlusOutlined,
  MessageOutlined,
  CloseOutlined,
  DragOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../../hooks/useAppSelector";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { clearMessages } from "../../store/chatSlice";
import { useHeightCommunication } from "../../hooks/useHeightCommunication";
import {
  getEmbeddingConfig,
  applyEmbeddingStyles,
} from "../../utils/embeddingUtils";
import MessageList from "../MessageList/MessageList";
import ChatInput from "../ChatInput/ChatInput";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import config from "../../config/config.json";
import "./ChatContainer.scss";

interface ChatContainerProps {
  userId?: string;
  token?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ userId, token }) => {
  console.log("User ID:", userId);
  console.log("Token:", token);
  const dispatch = useAppDispatch();
  const { isDark } = useAppSelector((state) => state.theme);
  const embeddingConfig = getEmbeddingConfig();
  const [isHalfScreenOpen, setIsHalfScreenOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const isHalfScreenMode = config.displayView === "half";

  // Enable height communication with parent window
  useHeightCommunication();

  // Apply embedding styles
  React.useEffect(() => {
    applyEmbeddingStyles(embeddingConfig);
  }, [embeddingConfig]);

  // Handle resize functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 300;
      const maxWidth = Math.min(800, window.innerWidth * 0.8);

      setChatWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  // Theme and font family integration.
  useEffect(() => {
    // Theme color setup.
    let primaryColorVal: any = sessionStorage.getItem('primaryColor')
    const primaryColor = primaryColorVal
      ? primaryColorVal.startsWith('#')
        ? primaryColorVal
        : `#${primaryColorVal}`
      : '#000000';

    // Font family configuration.
    const airlineCode = sessionStorage.getItem('themeCode')
    const primaryRegularFont = airlineCode == 'XY' ? 'Flynas-Regular' : airlineCode == '6E' ? "Poppins-Regular" : airlineCode == 'QR' ? "graphik_regular" : "OpenSans-Regular";
    const primarySemiBoldFont = airlineCode == 'XY' ? "Flynas-SemiBold" : airlineCode == '6E' ? "Poppins-SemiBold" : airlineCode == 'QR' ? "graphik_bold" : "OpenSans-SemiBold";
    const primaryBoldFont = airlineCode == 'XY' ? 'Flynas-Bold' : airlineCode == '6E' ? "Poppins-Bold" : airlineCode == 'QR' ? "graphik_bold" : "OpenSans-Bold";
    const root = document.documentElement;

    // Variable declaration.
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--font-regular', primaryRegularFont);
    root.style.setProperty('--font-semibold', primarySemiBoldFont);
    root.style.setProperty('--font-bold', primaryBoldFont);
    root.style.setProperty('--font-title', primaryRegularFont);
  }, [])


  const handleNewChat = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const toggleHalfScreen = useCallback(() => {
    setIsHalfScreenOpen(!isHalfScreenOpen);
  }, [isHalfScreenOpen]);

  const closeHalfScreen = useCallback(() => {
    setIsHalfScreenOpen(false);
  }, []);

  const themeConfig = {
    algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      colorPrimary: "#1890ff",
      borderRadius: 8,
      fontSize: 14,
      colorBgContainer: isDark ? "#1f1f1f" : "#ffffff",
      colorBgElevated: isDark ? "#262626" : "#ffffff",
      colorText: isDark ? "#ffffff" : "#000000",
      colorTextSecondary: isDark ? "#d9d9d9" : "#666666",
      colorBorder: isDark ? "#424242" : "#d9d9d9",
    },
  };

  // Render chatbot icon for half-screen mode
  if (isHalfScreenMode && !isHalfScreenOpen) {
    return (
      <ConfigProvider theme={themeConfig}>
        <button
          className={`chatbot-icon ${isHalfScreenMode ? "show" : ""}`}
          onClick={toggleHalfScreen}
          aria-label="Open chat"
        >
          <MessageOutlined />
        </button>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={themeConfig}>
      <div
        className={`chat-container chat-container--${
          isDark ? "dark" : "light"
        } ${embeddingConfig.isEmbedded ? "embedded" : ""} ${
          isHalfScreenMode ? "half-screen" : ""
        } ${isHalfScreenOpen ? "open" : ""}`}
        style={
          isHalfScreenMode && isHalfScreenOpen
            ? { width: `${chatWidth}px` }
            : {}
        }
      >
        {isHalfScreenMode && isHalfScreenOpen && (
          <div
            ref={resizeRef}
            className="resize-handle"
            onMouseDown={handleMouseDown}
          >
            <DragOutlined />
          </div>
        )}
        {!embeddingConfig.hideSidebar && !isHalfScreenMode && (
          <div className={`sidebar sidebar--${isDark ? "dark" : "light"}`}>
            <div className="sidebar-header">
              <h2 className='cls-sidebar-header-text'>{config?.left_header}</h2>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                block
                onClick={handleNewChat}
                className="new-chat-button"
              >
                New Chat
              </Button>
            </div>
            {/* <div className="theme-toggle-container">
              <ThemeToggle />
            </div> */}
          </div>
        )}
        <div
          className={`main-chat-area main-chat-area--${
            isDark ? "dark" : "light"
          } ${
            embeddingConfig.hideSidebar || isHalfScreenMode ? "full-width" : ""
          }`}
        >
          {!embeddingConfig.hideHeader && (
            <div
              className={`chat-header chat-header--${
                isDark ? "dark" : "light"
              }`}
            >
              <div>
                <h3 className='cls-chart-header'>
                 {config.right_header}
                </h3>
              </div>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                {/* Show New Chat button only on mobile when sidebar is hidden */}
                {(embeddingConfig.hideSidebar || isHalfScreenMode) && (
                  <button
                    className="header-btn mobile-new-chat-btn"
                    onClick={handleNewChat}
                    aria-label="Start new chat"
                  >
                    New chat
                  </button>
                )}
                {isHalfScreenMode && (
                  <button
                    className="header-btn close-btn"
                    onClick={closeHalfScreen}
                    aria-label="Close chat"
                  >
                    <CloseOutlined />
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="chat-content">
            <MessageList />
            <ChatInput />
          </div>
        </div>
      </div>
      {/* Chatbot icon for half-screen mode when closed */}
      {isHalfScreenMode && !isHalfScreenOpen && (
        <button
          className={`chatbot-icon ${isHalfScreenMode ? "show" : ""}`}
          onClick={toggleHalfScreen}
          aria-label="Open chat"
        >
          <MessageOutlined />
        </button>
      )}
    </ConfigProvider>
  );
};

export default ChatContainer;
