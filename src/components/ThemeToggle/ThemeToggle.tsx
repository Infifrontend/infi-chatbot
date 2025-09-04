import React from "react";
import { Button, Tooltip } from "antd";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useAppSelector";
import { toggleTheme } from "../../store/themeSlice";
import "./ThemeToggle.scss";

const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector((state) => state.theme.isDark);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <Tooltip title={`Switch to ${isDark ? "light" : "dark"} mode`}>
      <Button
        type="text"
        icon={isDark ? <BulbOutlined /> : <BulbFilled />}
        onClick={handleToggle}
        className={`theme-toggle theme-toggle--${isDark ? "dark" : "light"}`}
        size="large"
      />
    </Tooltip>
  );
};

export default ThemeToggle;
