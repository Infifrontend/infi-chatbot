import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice";
import themeReducer from "./themeSlice";
import { ChatBotSerice } from "../services/service";

export const store = configureStore({
  reducer: {
    chat: chatReducer, // ✅ key must match state slice
    theme: themeReducer,
    [ChatBotSerice.reducerPath]: ChatBotSerice.reducer, // ✅ key from RTK Query service
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(ChatBotSerice.middleware),
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
