import React from "react";
import { Card, Avatar, Button, Tooltip } from "antd";
import { RobotOutlined, DownloadOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../hooks/useAppSelector";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import {
  Message,
  addUserMessage,
  sendMessageToAI,
} from "../../store/chatSlice";
import "./MessageItem.scss";
import CryptoJS from 'crypto-js';
import { saveAs } from 'file-saver';

// Mock configService for demonstration purposes. Replace with your actual service.
const mockConfigService = {
  get: (key: string): string | undefined => {
    if (key === 'en') {
      // Replace with your actual encryption key
      return 'your-secret-encryption-key-here';
    }
    return undefined;
  }
};

// Mock http service for demonstration purposes. Replace with your actual http client.
const mockHttp = {
  post: (url: string, body: FormData, options: { responseType: string }) => {
    // Simulate a successful download response
    return {
      subscribe: (callback: (response: Blob) => void) => {
        // Create a dummy blob for demonstration
        const dummyBlob = new Blob(["This is a dummy file content."], { type: "application/octet-stream" });
        callback(dummyBlob);
      }
    };
  }
};

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const dispatch = useAppDispatch();
  const isUser = message.sender === "user";
  const currentUser = useAppSelector((state) => state.chat.currentUser);

  const generateUserAvatar = () => {
    if (!currentUser?.firstName) return "U";

    const firstName = currentUser.firstName.trim();
    const lastName = currentUser.lastName?.trim();

    if (lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName.length >= 2) {
      return firstName.substring(0, 2).toUpperCase();
    } else {
      return firstName.charAt(0).toUpperCase();
    }
  };

  const handleDownload = (attachment: any) => {
    if (attachment.downloadUrl || attachment.url) {
      // This part is for handling direct download links
      if (attachment.downloadUrl) {
        const link = document.createElement("a");
        link.href = attachment.downloadUrl;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Optionally show a success message
        alert('Your report is downloaded properly');
      } else if (attachment.url) {
        // This part handles the case where the URL might be a direct file URL
        // and the server expects a specific content type or handling.
        // For binary data that needs encryption and POST request, use the downloadReport function.

        // Example: If attachment.url is meant for direct download without encryption
        // const link = document.createElement("a");
        // link.href = attachment.url;
        // link.download = attachment.name || 'downloaded_file';
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
        // alert('Your report is downloaded properly');

        // For the specific requirement of downloading binary info (like CSV/Excel)
        // via POST with encryption, we need to call a dedicated function.
        // Let's assume the attachment object has a property to indicate this.
        // For this example, we'll use a placeholder logic.
        // In a real scenario, you'd check attachment.type or a specific flag.

        // Simulating the download of binary info (CSV/Excel)
        // Assuming attachment.type indicates it's a file to be downloaded via POST
        if (attachment.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || attachment.type === 'text/csv') {
          downloadReport(attachment.dataForDownload, attachment.actionName, attachment.url, attachment.fileName);
        } else {
          // Fallback for other types if needed, or handle as direct link
          const link = document.createElement("a");
          link.href = attachment.url;
          link.download = attachment.name || 'downloaded_file';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          alert('Your report is downloaded properly');
        }
      }
    }
  };

  // Function to handle downloading binary files via POST with encryption
  const downloadReport = (
    inputData: any,
    actionName: string,
    url: string,
    fileName: string
  ): any => {
    // AES encryption
    // tslint:disable-next-line:max-line-length
    const data: string = CryptoJS.AES.encrypt(
      JSON.stringify(inputData),
      CryptoJS.enc.Base64.parse(mockConfigService.get('en')!), // Using mock service
      { mode: CryptoJS.mode.ECB }
    ).toString();
    const formData = new FormData();
    formData.append('data', data);

    // Use the mock http service for demonstration
    mockHttp.post(url, formData, { responseType: 'blob' })
      .subscribe((response: Blob) => {
        saveAs(response, `${fileName}.${actionName}`);
        alert('Your report is downloaded properly');
      });
  };


  const handleImageClick = (attachment: any) => {
    if (attachment.url || attachment.preview) {
      window.open(attachment.url || attachment.preview, "_blank");
    }
  };

  const handleChoiceClick = (choiceContent: string) => {
    // Send the choice as a new user message
    dispatch(addUserMessage({ content: choiceContent }));
    dispatch(sendMessageToAI({ message: choiceContent }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderContent = (content: string) => {
    // Use a regular expression to match all <table> tags and their content
    const tableRegex = /(<table[^>]*>[\s\S]*?<\/table>)/gi;
    // Replace each table with the table wrapped in a div with class 'table-scroll-container'
    const modifiedContent = content.replace(
      tableRegex,
      '<div class="table-scroll-container">$1</div>'
    );

    return <div dangerouslySetInnerHTML={{ __html: modifiedContent }} />;
  };

  return (
    <div
      className={`message-item message-item--${isUser ? "user" : "ai"} message-item--${
        isDark ? "dark" : "light"
      } ${message.isDownload ? 'message-item--download' : ''}`}
    >
      {/* <div className="cls-chat-avatar">
      <Avatar
        size={40}
        icon={!isUser ? <RobotOutlined /> : undefined}
        className={`message-avatar ${isUser ? "user-avatar" : "ai-avatar"}`}
      >
        {isUser ? generateUserAvatar() : "AI"}
      </Avatar>
      <span
            className={`message-time message-time--${
              isUser ? "user" : "ai"
            } message-time--${isDark ? "dark" : "light"}`}
          >
            {formatTime(message.timestamp)}
          </span>
      </div> */}
      
      <Avatar
        size={40}
        icon={!isUser ? <RobotOutlined /> : undefined}
        className={`message-avatar ${isUser ? "user-avatar" : "ai-avatar"}`}
      >
        {isUser ? generateUserAvatar() : "AI"}
      </Avatar>

      <div
        className={`message-content message-content--${isUser ? "user" : "ai"}`}
      >
        <div className="message-bubble-container">
          <Card
            size="small"
            className={`message-card message-card--${isUser ? "user" : "ai"}-${
              isDark ? "dark" : "light"
            }`}
            styles={{
              body: { padding: "12px 16px" },
            }}
          >
            <div
              className={`message-text message-text--${
                isUser ? "user" : "ai"
              } message-text--${isDark ? "dark" : "light"}`}
            >
              {renderContent(message.content)}
            </div>

            {/* Choices/Options */}
            {!isUser && message.choices && message.choices.length > 1 && (
              <div className="message-choices">
                <div className="choices-label">Choose an option:</div>
                {message.choices.slice(1).map((choice, index) => (
                  <Button
                    key={index}
                    type="default"
                    size="small"
                    onClick={() => handleChoiceClick(choice.message.content)}
                    className={`choice-button choice-button--${
                      isDark ? "dark" : "light"
                    }`}
                  >
                    {choice.message.content}
                  </Button>
                ))}
              </div>
            )}

            {/* File Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="message-attachments">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="attachment-item">
                    {attachment.type.startsWith("image/") ? (
                      <div
                        className="attachment-image"
                        onClick={() => handleImageClick(attachment)}
                        style={{ cursor: "pointer" }}
                      >
                        {attachment.preview && (
                          <img
                            src={attachment.preview}
                            alt={attachment.name}
                            style={{
                              maxWidth: "200px",
                              maxHeight: "200px",
                              borderRadius: "8px",
                            }}
                          />
                        )}
                        <div
                          className={`file-name-overlay file-name-overlay--${
                            isUser ? "user" : "ai"
                          }-${isDark ? "dark" : "light"}`}
                        >
                          Click to view
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`attachment-file attachment-file--${
                          isDark ? "dark" : "light"
                        }`}
                      >
                        <div className="file-info">
                          <div className="file-name">{attachment.name}</div>
                          <div className="file-size">
                            {formatFileSize(attachment.size)}
                          </div>
                        </div>
                      </div>
                    )}

                    {!isUser && (attachment.downloadUrl || attachment.url) && (
                      <Tooltip title="Download file">
                        <Button
                          type="text"
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownload(attachment)}
                          className="download-btn"
                        />
                      </Tooltip>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div
            className={`message-time message-time--${
              isUser ? "user" : "ai"
            } message-time--${isDark ? "dark" : "light"}`}
          >
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;