import React from 'react';
import ReactDOM from "react-dom/client";
import App from './App';

type AppData = {
  message: string;
};

declare global {
  interface Window {
    ReactApp: {
      root: ReactDOM.Root | null;
      init: (container: HTMLElement, data: AppData) => void;
    };
  }
}

const container = document.getElementById("root");

window.ReactApp = {
  root: null,
  init: (container, data) => {
    if (container) {
      if (!window.ReactApp.root) {
        window.ReactApp.root = ReactDOM.createRoot(container);
      }
      window.ReactApp.root.render(
        <React.StrictMode>
          <App data={data} />
        </React.StrictMode>
      );
    }
  },
};
if (container) {
  window.ReactApp.init(container, { message: "content for sample check" });
}

