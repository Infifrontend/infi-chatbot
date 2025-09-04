import { ChatBotSerice } from "./service";

const service = ChatBotSerice.enhanceEndpoints({
  addTagTypes: ["grmConfig"],
}).injectEndpoints({
  endpoints: (builder) => ({
    getChatResponse: builder.mutation<any, any>({
      query: (requestInfo) => ({
        method: "POST",
        url: `/chat/completions`,
        body: requestInfo,
        // ✅ Handle binary or JSON manually
        responseHandler: async (response) => {
          const contentType = response.headers.get("content-type") || "";

          if (
            contentType.includes("application/octet-stream") ||
            contentType.includes("application/vnd.openxmlformats") ||
            contentType.includes("text/csv") ||
            contentType.includes("application/pdf")
          ) {
            // Extract filename from Content-Disposition
            const disposition = response.headers.get("content-disposition") || "";
            const filenameMatch = disposition.match(/filename[^;=\n]=((['"]).?\2|[^;\n]*)/);
            const filename = filenameMatch ? filenameMatch[1].replace(/['"]/g, "") : "download";

            return {
              blob: await response.blob(),
              filename,
              contentType,
              isBinary: true
            };
          }

          // Default: JSON
          return await response.json();
        },
      }),
      // Now transformResponse is optional; responseHandler already gives correct data
      transformResponse: (response: any) => {
        return response;
      },
    }),
    getresponse1data: builder.query<any, string>({
      query: (jsonFileName) => ({
        url: `/staticResponse/${jsonFileName}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetChatResponseMutation, useLazyGetresponse1dataQuery } = service;