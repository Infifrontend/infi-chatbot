export const isEmbedded = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true; // If we can't access window.top, we're likely embedded
  }
};

export const getEmbeddingConfig = () => {
  const urlParams = new URLSearchParams(window.location.search);

  return {
    isEmbedded: isEmbedded(),
    theme: urlParams.get("theme") || "light",
    height: urlParams.get("height") || "auto",
    hideHeader: urlParams.get("hideHeader") === "true",
    hideSidebar: urlParams.get("hideSidebar") === "true",
  };
};

export const applyEmbeddingStyles = (
  config: ReturnType<typeof getEmbeddingConfig>
) => {
  const container = document.querySelector(".chat-container");
  if (container && config.isEmbedded) {
    container.classList.add("embedded");

    if (config.height !== "auto") {
      (container as HTMLElement).style.height = config.height;
    }
  }
};
