import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

export const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  secondaryText: '#666666',
  cardBackground: '#F5F5F5',
  primary: '#E63946',
};

export const darkTheme = {
  background: '#121212',
  text: '#FFFFFF',
  secondaryText: '#AAAAAA',
  cardBackground: '#1E1E1E',
  primary: '#E63946',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};