import { createSlice } from "@reduxjs/toolkit";

interface ThemeState {
  isDark: boolean;
}

const isDarkMode = localStorage.getItem("theme") === "dark";

// Apply initial theme class to body
if (typeof document !== "undefined") {
  document.body.className = isDarkMode ? "dark" : "light";
}

const initialState: ThemeState = {
  isDark: isDarkMode,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      localStorage.setItem("theme", state.isDark ? "dark" : "light");
      // Apply theme class to body
      document.body.className = state.isDark ? "dark" : "light";
    },
    setTheme: (state, action) => {
      state.isDark = action.payload;
      localStorage.setItem("theme", state.isDark ? "dark" : "light");
      // Apply theme class to body
      document.body.className = state.isDark ? "dark" : "light";
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
