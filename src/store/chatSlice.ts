import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { downloadFile, downloadBinaryFile, downloadDirectBinary, isBinaryResponse, detectFileType } from "../utils/downloadUtils";

export interface User {
  firstName: string;
  lastName?: string;
  email?: string;
}

export interface Message {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: number;
  isLoading?: boolean;
  choices?: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason?: string;
  }[];
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url?: string;
    preview?: string;
    downloadUrl?: string;
  }[];
  isDownload?: boolean;
  downloadSuccess?: boolean;
}

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  currentUser: User;
}

const initialState: ChatState = {
  messages: [],
  isTyping: false,
  currentUser: {
    firstName: "John",
    lastName: "Doe",
  },
};

// Dynamic response handling for both local and real backend API
export const sendMessageToAI = createAsyncThunk<
  any,
  { message: string; attachments?: any[]; requestData?: any; useRealAPI?: boolean }
>(
  "chat/sendMessageToAI",
  async ({ message, attachments, requestData, useRealAPI = false }, { dispatch, extra }) => {
    try {
      // Import the service endpoints
      const { ChatBotSerice } = await import("../services/service");

      let result;
      
      if (useRealAPI) {
        // Call real backend API
        result = await dispatch(
          (ChatBotSerice as any)?.endpoints?.getChatResponse?.initiate(requestData)
        ).unwrap();
      } else {
        // Determine which JSON file to load based on message content (local testing)
        const lowerMessage = message.toLowerCase().trim();
        let jsonFileName = "hello.json"; // default fallback

        // Map common keywords to JSON files
        if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
          jsonFileName = "hello.json";
        } else if (
          lowerMessage.includes("booking") ||
          lowerMessage.includes("flight")
        ) {
          jsonFileName = "bookingdetails.json";
        } else if (
          lowerMessage.includes("group") ||
          lowerMessage.includes("request")
        ) {
          jsonFileName = "GroupRequestReport.json";
        } else if (
          lowerMessage.includes("last 3 months") ||
          lowerMessage.includes("3 months")
        ) {
          jsonFileName = "last3months.json";
        } else if (
          lowerMessage.includes("download excel") ||
          lowerMessage.includes("excel")
        ) {
          jsonFileName = "sample_excel.json";
        } else if (
          lowerMessage.includes("download csv") ||
          lowerMessage.includes("csv")
        ) {
          jsonFileName = "sample_csv.json";
        } else if (
          lowerMessage.includes("report") ||
          lowerMessage.includes("get report")
        ) {
          jsonFileName = "getthereport.json";
        }

        result = await dispatch(
          // (ChatBotSerice as any)?.endpoints?.getresponse1data?.initiate(jsonFileName)
          (ChatBotSerice as any)?.endpoints?.getChatResponse?.initiate(
            requestData
          )
        ).unwrap();
      }

      // Check if response is binary format (either from real API or mock data)
      if (isBinaryResponse(result)) {
        const downloadSuccess = await downloadBinaryFile(result);
        const fileName = result.filename || 'report';
        return {
          id: "download-" + Date.now(),
          sender: "ai",
          content: downloadSuccess 
            ? `<p>Your report ('${fileName}') has been downloaded successfully.</p>`
            : `<p>Failed to download the report. Please try again.</p>`,
          timestamp: Date.now(),
          isDownload: true,
          downloadSuccess: downloadSuccess,
        };
      }

      // Return the entire JSON response object for text/html content
      return result;
    } catch (error: any) {
      console.error("Error loading response:", error);

      let errorMessage = error?.data?.detail ? error?.data?.detail : 'I apologize, but I encountered an error processing your request. Please try again or contact support.';

      // Fallback response if loading fails
      return {
        id: "error-" + Date.now(),
        choices: [
          {
            message: {
              role: "assistant",
              content: `<p>${errorMessage}</p>`,
            },
          },
        ],
      };
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addUserMessage: (
      state,
      action: PayloadAction<{ content: string; attachments?: any[] }>
    ) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: "user",
        content: action.payload.content,
        timestamp: Date.now(),
        attachments: action.payload.attachments,
      };
      state.messages.push(newMessage);
    },
    updateUser: (
      state,
      action: PayloadAction<Partial<ChatState["currentUser"]>>
    ) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.isTyping = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessageToAI.pending, (state) => {
        state.isTyping = true;
      })
      .addCase(sendMessageToAI.fulfilled, (state, action) => {
        state.isTyping = false;
        const responseData = action.payload;

        // Check if the payload is a direct message object (for downloads)
        if (responseData.sender === "ai" && responseData.isDownload) {
          state.messages.push(responseData);
          return;
        }

        // Handle regular text/HTML responses
        let content = "";
        let choices = undefined;

        if (responseData.choices && responseData.choices.length > 0) {
          content = responseData.choices[0].message.content;
          choices = responseData.choices;
        } else if (responseData.content) {
          // Handle cases where response is directly the content
          content = responseData.content;
        } else {
          // Fallback for unexpected response structures
          content = `<p>Received an unexpected response format.</p>`;
        }

        const aiMessage: Message = {
          id: responseData.id || Date.now().toString(),
          sender: "ai",
          content: content,
          timestamp: Date.now(),
          choices: choices,
        };
        state.messages.push(aiMessage);
      })
      .addCase(sendMessageToAI.rejected, (state) => {
        state.isTyping = false;
        const errorMessage: Message = {
          id: Date.now().toString(),
          sender: "ai",
          content:
            "I apologize, but I encountered an error processing your request. Please try again.",
          timestamp: Date.now(),
        };
        state.messages.push(errorMessage);
      });
  },
});

export const { addUserMessage, setTyping, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;