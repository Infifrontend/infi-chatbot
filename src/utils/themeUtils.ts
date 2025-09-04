export interface AirlineTheme {
  name: string;
  className: string;
  fontFamily: string;
  primaryColor: string;
}

export const AIRLINE_THEMES: AirlineTheme[] = [
  {
    name: "Default",
    className: "",
    fontFamily: "system-ui",
    primaryColor: "#fd9646",
  },
  {
    name: "JetBlue",
    className: "airline-jetblue",
    fontFamily: "Poppins",
    primaryColor: "#2196f3",
  },
  {
    name: "American Airlines",
    className: "airline-american",
    fontFamily: "Helvetica Neue",
    primaryColor: "#c41e3a",
  },
];

export const switchAirlineTheme = (themeClassName: string) => {
  // Remove all existing airline theme classes
  AIRLINE_THEMES.forEach((theme) => {
    if (theme.className) {
      document.body.classList.remove(theme.className);
    }
  });

  // Add the new theme class if provided
  if (themeClassName) {
    document.body.classList.add(themeClassName);
  }
};

export const getCurrentAirlineTheme = (): AirlineTheme => {
  const currentTheme = AIRLINE_THEMES.find(
    (theme) =>
      theme.className && document.body.classList.contains(theme.className)
  );

  return currentTheme || AIRLINE_THEMES[0]; // Default theme
};
