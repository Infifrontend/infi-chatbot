import { useEffect } from "react";

export const useHeightCommunication = () => {
  useEffect(() => {
    // Function to send height to parent window
    const sendHeightToParent = () => {
      const height = document.documentElement.scrollHeight;

      // Send message to parent window if we're in an iframe
      if (window.parent !== window) {
        window.parent.postMessage(
          {
            type: "chatbot-height-update",
            chatbotHeight: height,
          },
          "*"
        );
      }
    };

    // Create ResizeObserver to watch for size changes
    const observer = new ResizeObserver(() => {
      sendHeightToParent();
    });

    // Observe the document body
    observer.observe(document.body);

    // Also observe the root element
    const rootElement = document.getElementById("root");
    if (rootElement) {
      observer.observe(rootElement);
    }

    // Send initial height
    sendHeightToParent();

    // Listen for content changes (like new messages)
    const mutationObserver = new MutationObserver(() => {
      // Debounce the height calculation
      setTimeout(sendHeightToParent, 100);
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Cleanup
    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
};
