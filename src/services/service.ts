import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Wrap fetchBaseQuery with timeout support
const fetchBaseQueryWithTimeout =
  (timeout = 5 * 60 * 1000) => // default 5 minutes
  async (args: any, api: any, extraOptions: any) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const baseQuery = fetchBaseQuery({
        // baseUrl: "/",
        baseUrl: window.location.origin + "/v1",
        prepareHeaders: (headers, { endpoint }) => {
          const token = localStorage.getItem("authToken");

          if (token) {
            headers.set("Authorization", `Bearer ${token}`);
          } else {
            headers.set(
              "Authorization",
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            );
          }

          if (endpoint !== "fileUpload" && endpoint !== "importAirlineConfig") {
            headers.set("Content-Type", "application/json");
          }
          return headers;
        },
      });

      // ✅ Pass abort signal into the base query
      return await baseQuery(args, api, { ...extraOptions, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  };

// Define your API service
const ChatBotSerice = createApi({
  reducerPath: "GRMConfig",
  baseQuery: fetchBaseQueryWithTimeout(300000), // 5 min timeout
  endpoints: () => ({}),
});

export { ChatBotSerice };