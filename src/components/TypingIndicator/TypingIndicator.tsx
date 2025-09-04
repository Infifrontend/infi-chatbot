import React from "react";
import { Avatar, Card } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../hooks/useAppSelector";
import "./TypingIndicator.scss";

const TypingIndicator: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);

  return (
    <div className="typing-indicator">
      <Avatar size={40} className="typing-avatar" icon={<RobotOutlined />}>
        AI
      </Avatar>

      <Card
        size="small"
        className={`typing-card typing-card--${isDark ? "dark" : "light"}`}
        styles={{
          body: {
            padding: "12px 16px",
          },
        }}
      >
        <div className="typing-dots">
          <div
            className={`typing-dot typing-dot--${isDark ? "dark" : "light"}`}
          />
          <div
            className={`typing-dot typing-dot--${isDark ? "dark" : "light"}`}
          />
          <div
            className={`typing-dot typing-dot--${isDark ? "dark" : "light"}`}
          />
        </div>
      </Card>
    </div>
  );
};

export default TypingIndicator;
